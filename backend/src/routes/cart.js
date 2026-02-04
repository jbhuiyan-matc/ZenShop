import express from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { validateRequest } from '../middleware/validate.js';
import { isAuthenticated } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';

const router = express.Router();
const prisma = new PrismaClient();

// Schema for cart item validation
const cartItemSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  quantity: z.number().int().positive('Quantity must be a positive integer')
});

// Schema for updating cart item (quantity only)
const updateCartItemSchema = z.object({
  quantity: z.number().int().positive('Quantity must be a positive integer')
});

// Get cart for current user
router.get('/', isAuthenticated, async (req, res, next) => {
  try {
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: req.user.id },
      include: { product: true }
    });

    res.json(cartItems);
  } catch (error) {
    logger.error('Error fetching cart:', error);
    next(error);
  }
});

// Add item to cart
router.post('/', isAuthenticated, validateRequest(cartItemSchema), async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;

    // Check if product exists and has enough stock
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ error: 'Not enough stock available' });
    }

    // Check if item already exists in cart
    const existingCartItem = await prisma.cartItem.findFirst({
      where: {
        userId: req.user.id,
        productId
      }
    });

    let cartItem;

    if (existingCartItem) {
      // Update quantity if item already exists
      cartItem = await prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: { quantity: existingCartItem.quantity + quantity },
        include: { product: true }
      });
    } else {
      // Create new cart item
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
    logger.error('Error adding item to cart:', error);
    next(error);
  }
});

// Update cart item quantity
router.put('/:id', isAuthenticated, validateRequest(updateCartItemSchema), async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const { id } = req.params;

    // Verify the cart item belongs to the user
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id,
        userId: req.user.id
      }
    });

    if (!cartItem) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    // Check product stock
    const product = await prisma.product.findUnique({
      where: { id: cartItem.productId }
    });

    if (product.stock < quantity) {
      return res.status(400).json({ error: 'Not enough stock available' });
    }

    // Update cart item
    const updatedCartItem = await prisma.cartItem.update({
      where: { id },
      data: { quantity },
      include: { product: true }
    });

    res.json(updatedCartItem);
  } catch (error) {
    logger.error(`Error updating cart item ${req.params.id}:`, error);
    next(error);
  }
});

// Remove item from cart
router.delete('/:id', isAuthenticated, async (req, res, next) => {
  try {
    const { id } = req.params;

    // Verify the cart item belongs to the user
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id,
        userId: req.user.id
      }
    });

    if (!cartItem) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    // Delete cart item
    await prisma.cartItem.delete({
      where: { id }
    });

    res.status(204).end();
  } catch (error) {
    logger.error(`Error deleting cart item ${req.params.id}:`, error);
    next(error);
  }
});

// Clear cart
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
