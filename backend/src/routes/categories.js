import express from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { validateRequest } from '../middleware/validate.js';
import { isAuthenticated, isAdmin } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';

const router = express.Router();
const prisma = new PrismaClient();

// Schema for category validation
const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  description: z.string().optional(),
  imageUrl: z.string().url('Invalid image URL').optional().nullable()
});

// Get all categories
router.get('/', async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true }
        }
      }
    });
    res.json(categories);
  } catch (error) {
    logger.error('Error fetching categories:', error);
    next(error);
  }
});

// Get a single category by ID with its products
router.get('/:id', async (req, res, next) => {
  try {
    const category = await prisma.category.findUnique({
      where: { id: req.params.id },
      include: {
        products: true
      }
    });

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json(category);
  } catch (error) {
    logger.error(`Error fetching category ${req.params.id}:`, error);
    next(error);
  }
});

// Create a new category (admin only)
router.post('/', isAuthenticated, isAdmin, validateRequest(categorySchema), async (req, res, next) => {
  try {
    const category = await prisma.category.create({
      data: {
        name: req.body.name,
        description: req.body.description,
        imageUrl: req.body.imageUrl
      }
    });

    res.status(201).json(category);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Category with this name already exists' });
    }
    logger.error('Error creating category:', error);
    next(error);
  }
});

// Update a category (admin only)
router.put('/:id', isAuthenticated, isAdmin, validateRequest(categorySchema), async (req, res, next) => {
  try {
    const category = await prisma.category.update({
      where: { id: req.params.id },
      data: {
        name: req.body.name,
        description: req.body.description,
        imageUrl: req.body.imageUrl
      }
    });

    res.json(category);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Category with this name already exists' });
    }
    logger.error(`Error updating category ${req.params.id}:`, error);
    next(error);
  }
});

// Delete a category (admin only)
router.delete('/:id', isAuthenticated, isAdmin, async (req, res, next) => {
  try {
    await prisma.category.delete({
      where: { id: req.params.id }
    });

    res.status(204).end();
  } catch (error) {
    logger.error(`Error deleting category ${req.params.id}:`, error);
    next(error);
  }
});

export default router;
