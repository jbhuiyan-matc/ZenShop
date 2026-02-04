import express from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { validateRequest } from '../middleware/validate.js';
import { isAuthenticated, isAdmin } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';

const router = express.Router();
const prisma = new PrismaClient();

/**
 * Validation Schema for Product Creation/Update
 */
const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  description: z.string().optional(),
  price: z.number().positive('Price must be a positive number'),
  imageUrl: z.string().url('Invalid image URL format').optional().nullable(),
  stock: z.number().int().nonnegative('Stock cannot be negative'),
  categoryId: z.string().optional().nullable()
});

/**
 * @route   GET /api/products
 * @desc    Retrieve a list of all products
 * @access  Public
 * @query   categoryId (optional) - Filter by category
 * @query   search (optional) - Search by name or description
 */
router.get('/', async (req, res, next) => {
  try {
    const { categoryId, search } = req.query;
    
    // Build the query filter
    const where = {};
    
    if (categoryId) {
      where.categoryId = categoryId;
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    const products = await prisma.product.findMany({
      where,
      include: {
        category: {
          select: { id: true, name: true }
        }
      },
      orderBy: { createdAt: 'desc' } // Default sort by newest
    });
    
    res.json(products);
  } catch (error) {
    logger.error('Failed to fetch products:', error);
    next(error);
  }
});

/**
 * @route   GET /api/products/:id
 * @desc    Retrieve a single product by its ID
 * @access  Public
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: {
          select: { id: true, name: true }
        }
      }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    logger.error(`Failed to fetch product with ID ${req.params.id}:`, error);
    next(error);
  }
});

/**
 * @route   POST /api/products
 * @desc    Create a new product
 * @access  Private (Admin only)
 */
router.post('/', isAuthenticated, isAdmin, validateRequest(productSchema), async (req, res, next) => {
  try {
    const { name, description, price, imageUrl, stock, categoryId } = req.body;

    const newProduct = await prisma.product.create({
      data: {
        name,
        description,
        price,
        imageUrl,
        stock,
        categoryId
      },
      include: {
        category: {
          select: { id: true, name: true }
        }
      }
    });

    logger.info(`Product created: ${newProduct.id} by User: ${req.user.id}`);
    res.status(201).json(newProduct);
  } catch (error) {
    logger.error('Failed to create product:', error);
    next(error);
  }
});

/**
 * @route   PUT /api/products/:id
 * @desc    Update an existing product
 * @access  Private (Admin only)
 */
router.put('/:id', isAuthenticated, isAdmin, validateRequest(productSchema), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, price, imageUrl, stock, categoryId } = req.body;

    // Check if product exists first
    const existingProduct = await prisma.product.findUnique({ where: { id } });
    if (!existingProduct) {
      return res.status(404).json({ error: 'Product to update not found' });
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        name,
        description,
        price,
        imageUrl,
        stock,
        categoryId
      },
      include: {
        category: {
          select: { id: true, name: true }
        }
      }
    });

    logger.info(`Product updated: ${id} by User: ${req.user.id}`);
    res.json(updatedProduct);
  } catch (error) {
    logger.error(`Failed to update product ${req.params.id}:`, error);
    next(error);
  }
});

/**
 * @route   DELETE /api/products/:id
 * @desc    Delete a product
 * @access  Private (Admin only)
 */
router.delete('/:id', isAuthenticated, isAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({ where: { id } });
    if (!existingProduct) {
      return res.status(404).json({ error: 'Product to delete not found' });
    }

    await prisma.product.delete({
      where: { id }
    });

    logger.info(`Product deleted: ${id} by User: ${req.user.id}`);
    res.status(204).end();
  } catch (error) {
    logger.error(`Failed to delete product ${req.params.id}:`, error);
    next(error);
  }
});

export default router;
