import express from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { validateRequest } from '../middleware/validate.js';
import { isAuthenticated } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';

const router = express.Router();
const prisma = new PrismaClient();

/**
 * Validation Schemas
 */
const cartItemSchema = z.object({
  productId: z.string().uuid('Invalid product ID format'),
  quantity: z.number().int().positive('Quantity must be a positive integer')
});

const updateCartItemSchema = z.object({
  quantity: z.number().int().positive('Quantity must be a positive integer')
});

/**
 * @route   GET /api/cart
 * @desc    Get the current user's shopping cart
 * @access  Private
 */
router.get('/', isAuthenticated, async (req, res, next) => {
  try {
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: req.user.id },
      include: { 
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            imageUrl: true,
            stock: true
          }
        } 
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(cartItems);
  } catch (error) {
    logger.error('Failed to fetch cart:', error);
    next(error);
  }
});

/**
 * @route   POST /api/cart
 * @desc    Add an item to the cart
 * @access  Private
 */
router.post('/', isAuthenticated, validateRequest(cartItemSchema), async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;

    // 1. Verify product exists and has stock
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ error: `Insufficient stock. Only ${product.stock} items available.` });
    }

    // 2. Check if item is already in the cart
    const existingCartItem = await prisma.cartItem.findFirst({
      where: {
        userId: req.user.id,
        productId
      }
    });

    let cartItem;

    if (existingCartItem) {
      // 3a. Update quantity if exists
      // Check total quantity against stock
      const newTotalQuantity = existingCartItem.quantity + quantity;
      
      if (product.stock < newTotalQuantity) {
         return res.status(400).json({ 
           error: `Cannot add ${quantity} more. You already have ${existingCartItem.quantity} in cart and only ${product.stock} are available.` 
         });
      }

      cartItem = await prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: { quantity: newTotalQuantity },
        include: { product: true }
      });
      
      logger.info(`Cart updated: User ${req.user.id} increased quantity of ${productId} to ${newTotalQuantity}`);
    } else {
      // 3b. Create new cart item
      cartItem = await prisma.cartItem.create({
        data: {
          userId: req.user.id,
          productId,
          quantity
        },
        include: { product: true }
      });
      
      logger.info(`Cart updated: User ${req.user.id} added ${quantity} of ${productId}`);
    }

    res.status(201).json(cartItem);
  } catch (error) {
    logger.error('Failed to add item to cart:', error);
    next(error);
  }
});

/**
 * @route   PUT /api/cart/:id
 * @desc    Update quantity of a cart item
 * @access  Private
 */
router.put('/:id', isAuthenticated, validateRequest(updateCartItemSchema), async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const { id } = req.params;

    // 1. Verify cart item ownership
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id,
        userId: req.user.id
      }
    });

    if (!cartItem) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    // 2. Check stock availability
    const product = await prisma.product.findUnique({
      where: { id: cartItem.productId }
    });

    // If product was deleted, remove from cart
    if (!product) {
        await prisma.cartItem.delete({ where: { id } });
        return res.status(404).json({ error: 'Product no longer exists' });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ error: `Insufficient stock. Only ${product.stock} items available.` });
    }

    // 3. Update cart item
    const updatedCartItem = await prisma.cartItem.update({
      where: { id },
      data: { quantity },
      include: { product: true }
    });

    logger.info(`Cart updated: User ${req.user.id} set quantity of item ${id} to ${quantity}`);
    res.json(updatedCartItem);
  } catch (error) {
    logger.error(`Failed to update cart item ${req.params.id}:`, error);
    next(error);
  }
});

/**
 * @route   DELETE /api/cart/:id
 * @desc    Remove an item from the cart
 * @access  Private
 */
router.delete('/:id', isAuthenticated, async (req, res, next) => {
  try {
    const { id } = req.params;

    // 1. Verify cart item ownership
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id,
        userId: req.user.id
      }
    });

    if (!cartItem) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    // 2. Delete item
    await prisma.cartItem.delete({
      where: { id }
    });

    logger.info(`Cart updated: User ${req.user.id} removed item ${id}`);
    res.status(204).end();
  } catch (error) {
    logger.error(`Failed to delete cart item ${req.params.id}:`, error);
    next(error);
  }
});

/**
 * @route   DELETE /api/cart
 * @desc    Clear the entire cart
 * @access  Private
 */
router.delete('/', isAuthenticated, async (req, res, next) => {
  try {
    await prisma.cartItem.deleteMany({
      where: { userId: req.user.id }
    });

    logger.info(`Cart cleared: User ${req.user.id} emptied their cart`);
    res.status(204).end();
  } catch (error) {
    logger.error('Failed to clear cart:', error);
    next(error);
  }
});

export default router;
