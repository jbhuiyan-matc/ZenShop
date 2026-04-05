import express from 'express';
import { isAuthenticated, isAdmin } from '../middleware/auth.js';
import * as adminController from '../controllers/adminController.js';

const router = express.Router();

/**
 * @route   GET /api/admin/stats
 * @desc    Get dashboard statistics for the admin panel
 * @access  Private (Admin)
 */
router.get('/stats', isAuthenticated, isAdmin, adminController.getStats);

export default router;
