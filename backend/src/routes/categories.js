import express from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { validateRequest } from '../middleware/validate.js';
import { isAuthenticated, isAdmin } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';

const router = express.Router();
const prisma = new PrismaClient();

/**
 * Validation Schemas
 */
const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  description: z.string().optional(),
  imageUrl: z.string().url('Invalid image URL format').optional().nullable()
});

/**
 * @route   GET /api/categories
 * @desc    Get all categories with product counts
 * @access  Public
 */
router.get('/', async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true }
        }
      },
      orderBy: { name: 'asc' }
    });
    res.json(categories);
  } catch (error) {
    logger.error('Failed to fetch categories:', error);
    next(error);
  }
});

/**
 * @route   GET /api/categories/:id
 * @desc    Get a single category by ID with its products
 * @access  Public
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        products: {
          select: {
            id: true,
            name: true,
            price: true,
            imageUrl: true,
            stock: true,
            description: true
          }
        }
      }
    });

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json(category);
  } catch (error) {
    logger.error(`Failed to fetch category ${req.params.id}:`, error);
    next(error);
  }
});

/**
 * @route   POST /api/categories
 * @desc    Create a new category
 * @access  Private (Admin)
 */
router.post('/', isAuthenticated, isAdmin, validateRequest(categorySchema), async (req, res, next) => {
  try {
    const { name, description, imageUrl } = req.body;

    const category = await prisma.category.create({
      data: {
        name,
        description,
        imageUrl
      }
    });

    logger.info(`Category created: ${category.id} (${category.name}) by Admin ${req.user.id}`);
    res.status(201).json(category);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Category with this name already exists' });
    }
    logger.error('Failed to create category:', error);
    next(error);
  }
});

/**
 * @route   PUT /api/categories/:id
 * @desc    Update a category
 * @access  Private (Admin)
 */
router.put('/:id', isAuthenticated, isAdmin, validateRequest(categorySchema), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, imageUrl } = req.body;

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({ where: { id } });
    if (!existingCategory) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const updatedCategory = await prisma.category.update({
      where: { id },
      data: {
        name,
        description,
        imageUrl
      }
    });

    logger.info(`Category updated: ${id} by Admin ${req.user.id}`);
    res.json(updatedCategory);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Category with this name already exists' });
    }
    logger.error(`Failed to update category ${req.params.id}:`, error);
    next(error);
  }
});

/**
 * @route   DELETE /api/categories/:id
 * @desc    Delete a category
 * @access  Private (Admin)
 */
router.delete('/:id', isAuthenticated, isAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({ where: { id } });
    if (!existingCategory) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Optional: Check if category has products before deleting?
    // For now, we'll assume cascading delete or manual cleanup is handled by DB or user intent.
    // If Prisma schema doesn't cascade, this might fail if products exist.
    
    await prisma.category.delete({
      where: { id }
    });

    logger.info(`Category deleted: ${id} by Admin ${req.user.id}`);
    res.status(204).end();
  } catch (error) {
    // Handle foreign key constraint violations if products are linked
    if (error.code === 'P2003') {
      return res.status(400).json({ error: 'Cannot delete category containing products. Please reassign or delete products first.' });
    }
    logger.error(`Failed to delete category ${req.params.id}:`, error);
    next(error);
  }
});

export default router;
