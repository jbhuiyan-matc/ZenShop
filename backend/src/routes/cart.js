import express from 'express';
import { isAuthenticated } from '../middleware/auth.js';
import * as cartController from '../controllers/cartController.js';

const router = express.Router();

/**
 * GET /api/cart
 * Retrieves the current user's cart items.
 */
router.get('/', isAuthenticated, cartController.getCart);

/**
 * POST /api/cart
 * Adds an item to the cart or updates quantity if it already exists.
 */
router.post('/', isAuthenticated, cartController.addToCart);

/**
 * PUT /api/cart/:id
 * Updates quantity of a cart item.
 */
router.put('/:id', isAuthenticated, cartController.updateCartItem);

/**
 * DELETE /api/cart/:id
 * Removes a single item from the cart.
 */
router.delete('/:id', isAuthenticated, cartController.removeCartItem);

/**
 * DELETE /api/cart
 * Clears the entire cart for the user.
 */
router.delete('/', isAuthenticated, cartController.clearCart);

export default router;
