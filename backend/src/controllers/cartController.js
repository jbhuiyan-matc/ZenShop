import * as cartService from '../services/cartService.js';
import { logger } from '../utils/logger.js';

export const getCart = async (req, res, next) => {
  try {
    const cart = await cartService.getCart(req.user.id);
    res.json(cart);
  } catch (error) {
    logger.error('Error fetching cart:', error);
    next(error);
  }
};

export const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;
    const cartItem = await cartService.addToCart(req.user.id, productId, quantity);
    res.status(201).json(cartItem);
  } catch (error) {
    if (error.status) {
      res.status(error.status).json({ error: error.message });
    } else {
      logger.error('Error adding to cart:', error);
      next(error);
    }
  }
};

export const updateCartItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const updatedItem = await cartService.updateCartItem(req.user.id, req.params.id, quantity);
    res.json(updatedItem);
  } catch (error) {
    if (error.status) {
      res.status(error.status).json({ error: error.message });
    } else {
      logger.error('Error updating cart item:', error);
      next(error);
    }
  }
};

export const removeCartItem = async (req, res, next) => {
  try {
    await cartService.removeCartItem(req.user.id, req.params.id);
    res.status(204).end();
  } catch (error) {
    if (error.status) {
      res.status(error.status).json({ error: error.message });
    } else {
      logger.error('Error removing cart item:', error);
      next(error);
    }
  }
};

export const clearCart = async (req, res, next) => {
  try {
    await cartService.clearCart(req.user.id);
    res.status(204).end();
  } catch (error) {
    logger.error('Error clearing cart:', error);
    next(error);
  }
};
