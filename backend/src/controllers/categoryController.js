import * as categoryService from '../services/categoryService.js';
import { logger } from '../utils/logger.js';
import { clearCache } from '../utils/redis.js';

export const getAllCategories = async (req, res, next) => {
  try {
    const categories = await categoryService.getAllCategories();
    res.json(categories);
  } catch (error) {
    logger.error('Failed to fetch categories:', error);
    next(error);
  }
};

export const getCategoryById = async (req, res, next) => {
  try {
    const category = await categoryService.getCategoryById(req.params.id);
    res.json(category);
  } catch (error) {
    if (error.status) {
      res.status(error.status).json({ error: error.message });
    } else {
      logger.error(`Failed to fetch category ${req.params.id}:`, error);
      next(error);
    }
  }
};

export const createCategory = async (req, res, next) => {
  try {
    const { name, description, imageUrl } = req.body;
    const category = await categoryService.createCategory({ name, description, imageUrl });
    
    logger.info(`Category created: ${category.id} (${category.name}) by Admin ${req.user.id}`);
    await clearCache('cache:/api/categories*');
    
    res.status(201).json(category);
  } catch (error) {
    if (error.status) {
      res.status(error.status).json({ error: error.message });
    } else {
      logger.error('Failed to create category:', error);
      next(error);
    }
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    const { name, description, imageUrl } = req.body;
    const updatedCategory = await categoryService.updateCategory(req.params.id, { name, description, imageUrl });
    
    logger.info(`Category updated: ${req.params.id} by Admin ${req.user.id}`);
    await clearCache('cache:/api/categories*');
    
    res.json(updatedCategory);
  } catch (error) {
    if (error.status) {
      res.status(error.status).json({ error: error.message });
    } else {
      logger.error(`Failed to update category ${req.params.id}:`, error);
      next(error);
    }
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    await categoryService.deleteCategory(req.params.id);
    
    logger.info(`Category deleted: ${req.params.id} by Admin ${req.user.id}`);
    await clearCache('cache:/api/categories*');
    
    res.status(204).end();
  } catch (error) {
    if (error.status) {
      res.status(error.status).json({ error: error.message });
    } else {
      logger.error(`Failed to delete category ${req.params.id}:`, error);
      next(error);
    }
  }
};
