import express from 'express';
import { PrismaClient } from '@prisma/client';
import { isAuthenticated } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';

const router = express.Router();
const prisma = new PrismaClient();

/**
 * GET /api/orders
 * Retrieves the current user's order history.
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
    logger.error('Error fetching orders:', error);
    next(error);
  }
});

/**
 * GET /api/orders/:id
 * Retrieves a single order by ID.
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

    if (!order || order.userId !== req.user.id) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    logger.error('Error fetching order:', error);
    next(error);
  }
});

/**
 * POST /api/orders
 * Creates a new order from the provided items.
 */
router.post('/', isAuthenticated, async (req, res, next) => {
  try {
    const { items, shippingAddress } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'No items provided' });
    }

    // Calculate total and validate stock
    let total = 0;
    const orderItemsData = [];

    // Process items sequentially to validate logic (could be parallelized but safer here)
    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      
      if (!product) {
        return res.status(400).json({ error: `Product ${item.productId} not found` });
      }
      
      if (product.stock < item.quantity) {
        return res.status(400).json({ error: `Insufficient stock for ${product.name}` });
      }

      total += Number(product.price) * item.quantity;
      orderItemsData.push({
        productId: product.id,
        quantity: item.quantity,
        price: product.price
      });
    }

    // Create Order Transaction
    const order = await prisma.$transaction(async (tx) => {
      // 1. Create Order
      const newOrder = await tx.order.create({
        data: {
          userId: req.user.id,
          total: total,
          status: 'PAID', // Mocking immediate payment success
          orderItems: {
            create: orderItemsData
          }
        },
        include: { orderItems: true }
      });

      // 2. Decrement Stock
      for (const item of orderItemsData) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } }
        });
      }

      return newOrder;
    });

    logger.info(`Order created: ${order.id} for user ${req.user.id}`);
    res.status(201).json(order);
  } catch (error) {
    logger.error('Error creating order:', error);
    next(error);
  }
});

export default router;
