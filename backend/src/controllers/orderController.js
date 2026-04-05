import * as orderService from '../services/orderService.js';
import { logger } from '../utils/logger.js';

export const getOrders = async (req, res, next) => {
  try {
    const orders = await orderService.getOrders(req.user.id);
    res.json(orders);
  } catch (error) {
    logger.error('Error fetching orders:', error);
    next(error);
  }
};

export const getOrderById = async (req, res, next) => {
  try {
    const order = await orderService.getOrderById(req.user.id, req.params.id);
    res.json(order);
  } catch (error) {
    if (error.status) {
      res.status(error.status).json({ error: error.message });
    } else {
      logger.error('Error fetching order:', error);
      next(error);
    }
  }
};

export const createOrder = async (req, res, next) => {
  try {
    const { items } = req.body;
    const order = await orderService.createOrder(req.user.id, items);
    
    logger.info(`Order created: ${order.id} for user ${req.user.id}`);
    res.status(201).json(order);
  } catch (error) {
    if (error.status) {
      res.status(error.status).json({ error: error.message });
    } else {
      logger.error('Error creating order:', error);
      next(error);
    }
  }
};
