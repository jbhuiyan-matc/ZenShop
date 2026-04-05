import express from 'express';
import { isAuthenticated } from '../middleware/auth.js';
import * as orderController from '../controllers/orderController.js';

const router = express.Router();

/**
 * GET /api/orders
 * Retrieves the current user's order history.
 */
router.get('/', isAuthenticated, orderController.getOrders);

/**
 * GET /api/orders/:id
 * Retrieves a single order by ID.
 */
router.get('/:id', isAuthenticated, orderController.getOrderById);

/**
 * POST /api/orders
 * Creates a new order from the provided items.
 */
router.post('/', isAuthenticated, orderController.createOrder);

export default router;
