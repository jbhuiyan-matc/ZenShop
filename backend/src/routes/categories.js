import express from 'express';
import { z } from 'zod';
import { isAuthenticated, isAdmin } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validate.js';
import { cacheMiddleware } from '../middleware/cache.js';
import * as categoryController from '../controllers/categoryController.js';

const router = express.Router();

// Validation Schemas
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
router.get('/', cacheMiddleware(300), categoryController.getAllCategories);

/**
 * @route   GET /api/categories/:id
 * @desc    Get a single category by ID with its products
 * @access  Public
 */
router.get('/:id', cacheMiddleware(300), categoryController.getCategoryById);

/**
 * @route   POST /api/categories
 * @desc    Create a new category
 * @access  Private (Admin)
 */
router.post('/', isAuthenticated, isAdmin, validateRequest(categorySchema), categoryController.createCategory);

/**
 * @route   PUT /api/categories/:id
 * @desc    Update a category
 * @access  Private (Admin)
 */
router.put('/:id', isAuthenticated, isAdmin, validateRequest(categorySchema), categoryController.updateCategory);

/**
 * @route   DELETE /api/categories/:id
 * @desc    Delete a category
 * @access  Private (Admin)
 */
router.delete('/:id', isAuthenticated, isAdmin, categoryController.deleteCategory);

export default router;
