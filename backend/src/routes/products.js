import express from 'express';
import { z } from 'zod';
import { isAuthenticated, isAdmin } from '../middleware/auth.js';
import { cacheMiddleware } from '../middleware/cache.js';
import { validateRequest } from '../middleware/validate.js';
import * as productController from '../controllers/productController.js';

const router = express.Router();

// Validation Schemas
const productSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(100, 'Name too long'),
  description: z.string().optional(),
  price: z.number().positive('Price must be a positive number'),
  imageUrl: z.string().url('Invalid image URL format').optional().nullable(),
  stock: z.number().int().nonnegative('Stock cannot be negative'),
  categoryId: z.string().optional().nullable()
});

/**
 * GET /api/products
 * Retrieves a list of all products.
 */
router.get('/', cacheMiddleware(300), productController.getAllProducts);

/**
 * GET /api/products/:id
 * Retrieves a single product by its unique ID.
 */
router.get('/:id', cacheMiddleware(300), productController.getProductById);

/**
 * POST /api/products
 * Creates a new product in the catalog.
 */
router.post('/', isAuthenticated, isAdmin, validateRequest(productSchema), productController.createProduct);

/**
 * PUT /api/products/:id
 * Updates an existing product's details.
 */
router.put('/:id', isAuthenticated, isAdmin, validateRequest(productSchema), productController.updateProduct);

/**
 * DELETE /api/products/:id
 * Removes a product from the catalog.
 */
router.delete('/:id', isAuthenticated, isAdmin, productController.deleteProduct);

export default router;
