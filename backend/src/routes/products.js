import express from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { validateRequest } from '../middleware/validate.js';
import { isAuthenticated, isAdmin, createAuditLog } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';

const router = express.Router();
const prisma = new PrismaClient();

// =========================================
// Validation Schemas
// =========================================

/**
 * Zod schema for creating and updating products.
 * Enforces strict typing and validation rules.
 */
const productSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(100, 'Name too long'),
  description: z.string().optional(),
  price: z.number().positive('Price must be positive'),
  imageUrl: z.string().url('Invalid image URL').optional().nullable(),
  stock: z.number().int().nonnegative('Stock cannot be negative')
});

// =========================================
// Route Handlers
// =========================================

/**
 * GET /api/products
 * Retrieves a list of all products.
 * 
 * @access Public
 */
router.get('/', async (req, res, next) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' } // Return newest products first
    });
    
    res.status(200).json(products);
  } catch (error) {
    logger.error('Error fetching products:', error);
    next(error);
  }
});

/**
 * GET /api/products/:id
 * Retrieves a single product by its unique ID.
 * 
 * @access Public
 * @param {string} id - The product ID
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.status(200).json(product);
  } catch (error) {
    logger.error(`Error fetching product ${req.params.id}:`, error);
    next(error);
  }
});

/**
 * POST /api/products
 * Creates a new product in the catalog.
 * 
 * @access Private (Admin only)
 */
router.post('/', 
  isAuthenticated, 
  isAdmin, 
  validateRequest(productSchema), 
  async (req, res, next) => {
    try {
      const product = await prisma.product.create({
        data: {
          name: req.body.name,
          description: req.body.description,
          price: req.body.price,
          imageUrl: req.body.imageUrl,
          stock: req.body.stock
        }
      });

      // Log this administrative action
      await createAuditLog(
        req.user.id, 
        'CREATE_PRODUCT', 
        { productId: product.id, name: product.name }, 
        req
      );

      logger.info(`Product created: ${product.id} by user ${req.user.id}`);
      res.status(201).json(product);
    } catch (error) {
      logger.error('Error creating product:', error);
      next(error);
    }
});

/**
 * PUT /api/products/:id
 * Updates an existing product's details.
 * 
 * @access Private (Admin only)
 * @param {string} id - The product ID
 */
router.put('/:id', 
  isAuthenticated, 
  isAdmin, 
  validateRequest(productSchema), 
  async (req, res, next) => {
    try {
      const { id } = req.params;

      // Check if product exists first
      const existingProduct = await prisma.product.findUnique({ where: { id } });
      if (!existingProduct) {
        return res.status(404).json({ error: 'Product not found' });
      }

      const product = await prisma.product.update({
        where: { id },
        data: {
          name: req.body.name,
          description: req.body.description,
          price: req.body.price,
          imageUrl: req.body.imageUrl,
          stock: req.body.stock
        }
      });

      // Log this administrative action
      await createAuditLog(
        req.user.id, 
        'UPDATE_PRODUCT', 
        { productId: product.id, changes: req.body }, 
        req
      );

      logger.info(`Product updated: ${product.id} by user ${req.user.id}`);
      res.status(200).json(product);
    } catch (error) {
      logger.error(`Error updating product ${req.params.id}:`, error);
      next(error);
    }
});

/**
 * DELETE /api/products/:id
 * Removes a product from the catalog.
 * 
 * @access Private (Admin only)
 * @param {string} id - The product ID
 */
router.delete('/:id', 
  isAuthenticated, 
  isAdmin, 
  async (req, res, next) => {
    try {
      const { id } = req.params;

      // Check if product exists first
      const existingProduct = await prisma.product.findUnique({ where: { id } });
      if (!existingProduct) {
        return res.status(404).json({ error: 'Product not found' });
      }

      await prisma.product.delete({
        where: { id }
      });

      // Log this administrative action
      await createAuditLog(
        req.user.id, 
        'DELETE_PRODUCT', 
        { productId: id, name: existingProduct.name }, 
        req
      );

      logger.info(`Product deleted: ${id} by user ${req.user.id}`);
      res.status(204).end();
    } catch (error) {
      logger.error(`Error deleting product ${req.params.id}:`, error);
      next(error);
    }
});

export default router;
