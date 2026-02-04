import express from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { validateRequest } from '../middleware/validate.js';
import { isAuthenticated, isAdmin } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';

const router = express.Router();
const prisma = new PrismaClient();

/**
 * Validation Schemas
 */
const createOrderSchema = z.object({
  items: z.array(z.object({
    productId: z.string().uuid('Invalid product ID'),
    quantity: z.number().int().positive('Quantity must be a positive integer')
  })).nonempty('Order must contain at least one item')
});

const updateOrderStatusSchema = z.object({
  status: z.enum(['PENDING_PAYMENT', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'], {
    errorMap: () => ({ message: 'Status must be one of: PENDING_PAYMENT, PAID, SHIPPED, DELIVERED, CANCELLED' })
  })
});

/**
 * @route   GET /api/orders
 * @desc    Get order history for the current user
 * @access  Private
 */
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
    logger.error('Failed to fetch orders:', error);
    next(error);
  }
});

/**
 * @route   GET /api/orders/admin
 * @desc    Get all orders (Admin only)
 * @access  Private (Admin)
 */
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
    logger.error('Failed to fetch all orders:', error);
    next(error);
  }
});

/**
 * @route   GET /api/orders/:id
 * @desc    Get a single order by ID
 * @access  Private (Owner or Admin)
 */
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

    // Authorization Check: Owner or Admin
    if (order.userId !== req.user.id && req.user.role !== 'ADMIN') {
      logger.warn(`Access denied: User ${req.user.id} attempted to view order ${id}`);
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(order);
  } catch (error) {
    logger.error(`Failed to fetch order ${req.params.id}:`, error);
    next(error);
  }
});

/**
 * @route   POST /api/orders
 * @desc    Create a new order from cart items
 * @access  Private
 */
router.post('/', isAuthenticated, validateRequest(createOrderSchema), async (req, res, next) => {
  const { items } = req.body;

  try {
    // Transaction ensures stock is updated and order is created atomically
    const order = await prisma.$transaction(async (prisma) => {
      // 1. Validate items and calculate total
      let total = 0;
      
      for (const item of items) {
        const product = await prisma.product.findUnique({
          where: { id: item.productId }
        });

        if (!product) {
          throw new Error(`Product with id ${item.productId} not found`);
        }

        if (product.stock < item.quantity) {
          throw new Error(`Insufficient stock for product: ${product.name}`);
        }

        total += Number(product.price) * item.quantity;
      }

      // 2. Create the Order
      const newOrder = await prisma.order.create({
        data: {
          userId: req.user.id,
          total,
          status: 'PENDING_PAYMENT',
          orderItems: {
            create: items.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              price: 0 // Will be updated below with current product price
            }))
          }
        },
        include: {
          orderItems: true
        }
      });

      // 3. Update stock and record price snapshot
      for (const item of newOrder.orderItems) {
        const product = await prisma.product.findUnique({
          where: { id: item.productId }
        });

        // Set the price at time of purchase
        await prisma.orderItem.update({
          where: { id: item.id },
          data: { price: product.price }
        });

        // Decrement stock
        await prisma.product.update({
          where: { id: item.productId },
          data: { stock: product.stock - item.quantity }
        });
      }

      // 4. Clear User's Cart
      await prisma.cartItem.deleteMany({
        where: { userId: req.user.id }
      });

      // Return complete order structure
      return prisma.order.findUnique({
        where: { id: newOrder.id },
        include: {
          orderItems: {
            include: { product: true }
          }
        }
      });
    });

    logger.info(`Order created: ${order.id} by User ${req.user.id}`);
    res.status(201).json(order);

  } catch (error) {
    logger.error('Order creation failed:', error);
    
    // Handle specific business logic errors from the transaction
    if (error.message.includes('not found') || error.message.includes('Insufficient stock')) {
      return res.status(400).json({ error: error.message });
    }
    
    next(error);
  }
});

/**
 * @route   PATCH /api/orders/:id/status
 * @desc    Update order status
 * @access  Private (Admin)
 */
router.patch('/:id/status', isAuthenticated, isAdmin, validateRequest(updateOrderStatusSchema), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await prisma.order.findUnique({ where: { id } });

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

    logger.info(`Order status updated: ${id} -> ${status} by Admin ${req.user.id}`);
    res.json(updatedOrder);
  } catch (error) {
    logger.error(`Failed to update order status ${req.params.id}:`, error);
    next(error);
  }
});

/**
 * @route   PATCH /api/orders/:id/cancel
 * @desc    Cancel an order (only if pending payment)
 * @access  Private (Owner or Admin)
 */
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

    // Authorization Check
    if (order.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Business Logic Validation
    if (order.status !== 'PENDING_PAYMENT') {
      return res.status(400).json({ error: 'Only pending orders can be cancelled' });
    }

    // Cancel order and restore stock in transaction
    const updatedOrder = await prisma.$transaction(async (prisma) => {
      // Update status
      await prisma.order.update({
        where: { id },
        data: { status: 'CANCELLED' }
      });

      // Restore stock
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

      return prisma.order.findUnique({
        where: { id },
        include: {
          orderItems: {
            include: { product: true }
          }
        }
      });
    });

    logger.info(`Order cancelled: ${id} by User ${req.user.id}`);
    res.json(updatedOrder);
  } catch (error) {
    logger.error(`Failed to cancel order ${req.params.id}:`, error);
    next(error);
  }
});

export default router;
