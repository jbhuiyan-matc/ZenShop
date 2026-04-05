import * as adminService from '../services/adminService.js';
import { logger } from '../utils/logger.js';

export const getStats = async (req, res, next) => {
  try {
    const stats = await adminService.getStats();
    res.json(stats);
  } catch (error) {
    logger.error('Failed to fetch admin stats:', error);
    next(error);
  }
};
