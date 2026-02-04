import express from 'express';
import { PrismaClient } from '@prisma/client';
import { isAuthenticated } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';

const router = express.Router();
const prisma = new PrismaClient();

/**
 * GET /api/cart
 * Retrieves the current user's shopping cart.
 */
router.get('/', isAuthenticated, async (req, res, next) => {
  try {
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: req.user.id },
      include: { product: true },
      orderBy: { createdAt: 'asc' }
    });
    res.json(cartItems);
  } catch (error) {
    logger.error('Error fetching cart:', error);
    next(error);
  }
});

/**
 * POST /api/cart
 * Adds an item to the cart or updates quantity if it exists.
 */
router.post('/', isAuthenticated, async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || !quantity || quantity < 1) {
      return res.status(400).json({ error: 'Invalid product or quantity' });
    }

    // Check if product exists and has stock
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    if (product.stock < quantity) {
      return res.status(400).json({ error: 'Insufficient stock' });
    }

    // Upsert cart item
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        userId_productId: {
          userId: req.user.id,
          productId
        }
      }
    });

    let cartItem;
    if (existingItem) {
      cartItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
        include: { product: true }
      });
    } else {
      cartItem = await prisma.cartItem.create({
        data: {
          userId: req.user.id,
          productId,
          quantity
        },
        include: { product: true }
      });
    }

    res.status(201).json(cartItem);
  } catch (error) {
    logger.error('Error adding to cart:', error);
    next(error);
  }
});

/**
 * PUT /api/cart/:id
 * Updates quantity of a cart item.
 */
router.put('/:id', isAuthenticated, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ error: 'Invalid quantity' });
    }

    // Ensure item belongs to user
    const item = await prisma.cartItem.findUnique({ where: { id } });
    if (!item || item.userId !== req.user.id) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    const updatedItem = await prisma.cartItem.update({
      where: { id },
      data: { quantity },
      include: { product: true }
    });

    res.json(updatedItem);
  } catch (error) {
    logger.error('Error updating cart item:', error);
    next(error);
  }
});

/**
 * DELETE /api/cart/:id
 * Removes a single item from the cart.
 */
router.delete('/:id', isAuthenticated, async (req, res, next) => {
  try {
    const { id } = req.params;

    // Ensure item belongs to user
    const item = await prisma.cartItem.findUnique({ where: { id } });
    if (!item || item.userId !== req.user.id) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    await prisma.cartItem.delete({ where: { id } });
    res.status(204).end();
  } catch (error) {
    logger.error('Error removing cart item:', error);
    next(error);
  }
});

/**
 * DELETE /api/cart
 * Clears the entire cart for the user.
 */
router.delete('/', isAuthenticated, async (req, res, next) => {
  try {
    await prisma.cartItem.deleteMany({
      where: { userId: req.user.id }
    });
    res.status(204).end();
  } catch (error) {
    logger.error('Error clearing cart:', error);
    next(error);
  }
});

export default router;
