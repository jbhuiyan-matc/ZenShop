import * as productService from '../services/productService.js';
import { logger } from '../utils/logger.js';
import { clearCache } from '../utils/redis.js';

export const getAllProducts = async (req, res, next) => {
  try {
    const { categoryId, search } = req.query;
    const products = await productService.getAllProducts(categoryId, search);
    res.status(200).json(products);
  } catch (error) {
    logger.error('Failed to fetch products:', error);
    next(error);
  }
};

export const getProductById = async (req, res, next) => {
  try {
    const product = await productService.getProductById(req.params.id);
    res.status(200).json(product);
  } catch (error) {
    if (error.status) {
      res.status(error.status).json({ error: error.message });
    } else {
      logger.error(`Failed to fetch product with ID ${req.params.id}:`, error);
      next(error);
    }
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const data = {
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      imageUrl: req.body.imageUrl,
      stock: req.body.stock,
      categoryId: req.body.categoryId
    };
    const product = await productService.createProduct(data);
    logger.info(`Product created: ${product.id} by user ${req.user.id}`);
    await clearCache('cache:/api/products*');
    res.status(201).json(product);
  } catch (error) {
    logger.error('Error creating product:', error);
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const data = {
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      imageUrl: req.body.imageUrl,
      stock: req.body.stock,
      categoryId: req.body.categoryId
    };
    const product = await productService.updateProduct(req.params.id, data);
    logger.info(`Product updated: ${product.id} by user ${req.user.id}`);
    await clearCache('cache:/api/products*');
    res.status(200).json(product);
  } catch (error) {
    if (error.status) {
      res.status(error.status).json({ error: error.message });
    } else {
      logger.error(`Error updating product ${req.params.id}:`, error);
      next(error);
    }
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    await productService.deleteProduct(req.params.id);
    logger.info(`Product deleted: ${req.params.id} by user ${req.user.id}`);
    await clearCache('cache:/api/products*');
    res.status(204).end();
  } catch (error) {
    if (error.status) {
      res.status(error.status).json({ error: error.message });
    } else {
      logger.error(`Error deleting product ${req.params.id}:`, error);
      next(error);
    }
  }
};
