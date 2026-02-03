import express from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { validateRequest } from '../middleware/validate.js';
import { isAuthenticated, isAdmin } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';

const router = express.Router();
const prisma = new PrismaClient();

// Schema for product validation
const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  description: z.string().optional(),
  price: z.number().positive('Price must be positive'),
  imageUrl: z.string().url('Invalid image URL').optional().nullable(),
  stock: z.number().int().nonnegative('Stock cannot be negative')
});

// Get all products
router.get('/', async (req, res, next) => {
  try {
    const products = await prisma.product.findMany();
    res.json(products);
  } catch (error) {
    logger.error('Error fetching products:', error);
    next(error);
  }
});

// Get a single product by ID
router.get('/:id', async (req, res, next) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    logger.error(`Error fetching product ${req.params.id}:`, error);
    next(error);
  }
});

// Create a new product (admin only)
router.post('/', isAuthenticated, isAdmin, validateRequest(productSchema), async (req, res, next) => {
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

    res.status(201).json(product);
  } catch (error) {
    logger.error('Error creating product:', error);
    next(error);
  }
});

// Update a product (admin only)
router.put('/:id', isAuthenticated, isAdmin, validateRequest(productSchema), async (req, res, next) => {
  try {
    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: {
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        imageUrl: req.body.imageUrl,
        stock: req.body.stock
      }
    });

    res.json(product);
  } catch (error) {
    logger.error(`Error updating product ${req.params.id}:`, error);
    next(error);
  }
});

// Delete a product (admin only)
router.delete('/:id', isAuthenticated, isAdmin, async (req, res, next) => {
  try {
    await prisma.product.delete({
      where: { id: req.params.id }
    });

    res.status(204).end();
  } catch (error) {
    logger.error(`Error deleting product ${req.params.id}:`, error);
    next(error);
  }
});

export default router;
