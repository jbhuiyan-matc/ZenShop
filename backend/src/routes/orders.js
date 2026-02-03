import express from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { validateRequest } from '../middleware/validate.js';
import { isAuthenticated, isAdmin } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';

const router = express.Router();
const prisma = new PrismaClient();

// Schema for order creation
const createOrderSchema = z.object({
  items: z.array(z.object({
    productId: z.string().uuid('Invalid product ID'),
    quantity: z.number().int().positive('Quantity must be a positive integer')
  })).nonempty('Order must contain at least one item')
});

// Schema for order status update
const updateOrderStatusSchema = z.object({
  status: z.enum(['PENDING_PAYMENT', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'], {
    errorMap: () => ({ message: 'Status must be one of: PENDING_PAYMENT, PAID, SHIPPED, DELIVERED, CANCELLED' })
  })
});

// Get orders for current user
router.get('/', isAuthenticated, async (req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      include: {
        orderItems: {
          include: { product: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(orders);
  } catch (error) {
    logger.error('Error fetching orders:', error);
    next(error);
  }
});

// Get all orders (admin only)
router.get('/admin', isAuthenticated, isAdmin, async (req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        },
        orderItems: {
          include: { product: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(orders);
  } catch (error) {
    logger.error('Error fetching all orders:', error);
    next(error);
  }
});

// Get single order by ID
router.get('/:id', isAuthenticated, async (req, res, next) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        orderItems: {
          include: { product: true }
        }
      }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check if the order belongs to the user or user is admin
    if (order.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(order);
  } catch (error) {
    logger.error(`Error fetching order ${req.params.id}:`, error);
    next(error);
  }
});

// Create a new order
router.post('/', isAuthenticated, validateRequest(createOrderSchema), async (req, res, next) => {
  const { items } = req.body;

  // Start a transaction
  try {
    const order = await prisma.$transaction(async (prisma) => {
      // Verify products and check stock
      let total = 0;
      for (const item of items) {
        const product = await prisma.product.findUnique({
          where: { id: item.productId }
        });

        if (!product) {
          throw new Error(`Product with id ${item.productId} not found`);
        }

        if (product.stock < item.quantity) {
          throw new Error(`Not enough stock for product ${product.name}`);
        }

        // Calculate item total
        total += Number(product.price) * item.quantity;
      }

      // Create order
      const order = await prisma.order.create({
        data: {
          userId: req.user.id,
          total,
          status: 'PENDING_PAYMENT',
          orderItems: {
            create: items.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              price: 0 // Will be updated below
            }))
          }
        },
        include: {
          orderItems: true
        }
      });

      // Update order items with correct prices and reduce stock
      for (const item of order.orderItems) {
        const product = await prisma.product.findUnique({
          where: { id: item.productId }
        });

        // Update order item price
        await prisma.orderItem.update({
          where: { id: item.id },
          data: { price: product.price }
        });

        // Update product stock
        await prisma.product.update({
          where: { id: item.productId },
          data: { stock: product.stock - item.quantity }
        });
      }

      // Clear the user's cart
      await prisma.cartItem.deleteMany({
        where: { userId: req.user.id }
      });

      // Return the updated order with products
      return prisma.order.findUnique({
        where: { id: order.id },
        include: {
          orderItems: {
            include: { product: true }
          }
        }
      });
    });

    res.status(201).json(order);
  } catch (error) {
    logger.error('Error creating order:', error);
    
    // Provide meaningful error message
    if (error.message.includes('not found') || error.message.includes('Not enough stock')) {
      return res.status(400).json({ error: error.message });
    }
    
    next(error);
  }
});

// Update order status (admin only)
router.patch('/:id/status', isAuthenticated, isAdmin, validateRequest(updateOrderStatusSchema), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await prisma.order.findUnique({
      where: { id }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        orderItems: {
          include: { product: true }
        }
      }
    });

    res.json(updatedOrder);
  } catch (error) {
    logger.error(`Error updating order status ${req.params.id}:`, error);
    next(error);
  }
});

// Cancel order (if it's in PENDING_PAYMENT status)
router.patch('/:id/cancel', isAuthenticated, async (req, res, next) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: { orderItems: true }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check if the order belongs to the user or user is admin
    if (order.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Can only cancel orders that are pending payment
    if (order.status !== 'PENDING_PAYMENT') {
      return res.status(400).json({ error: 'Can only cancel orders with PENDING_PAYMENT status' });
    }

    // Update order status and restore product stock
    const updatedOrder = await prisma.$transaction(async (prisma) => {
      // Update order status
      const updatedOrder = await prisma.order.update({
        where: { id },
        data: { status: 'CANCELLED' }
      });

      // Restore product stock
      for (const item of order.orderItems) {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              increment: item.quantity
            }
          }
        });
      }

      return updatedOrder;
    });

    // Return the updated order with products
    const orderWithItems = await prisma.order.findUnique({
      where: { id },
      include: {
        orderItems: {
          include: { product: true }
        }
      }
    });

    res.json(orderWithItems);
  } catch (error) {
    logger.error(`Error cancelling order ${req.params.id}:`, error);
    next(error);
  }
});

export default router;
