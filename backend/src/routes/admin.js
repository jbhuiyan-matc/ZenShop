import express from 'express';
import { isAuthenticated, isAdmin } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';
import { getPrisma } from '../utils/database.js';

const router = express.Router();
const getPrismaClient = () => getPrisma();

/**
 * @route   GET /api/admin/stats
 * @desc    Get dashboard statistics for the admin panel
 * @access  Private (Admin)
 */
router.get('/stats', isAuthenticated, isAdmin, async (req, res, next) => {
  try {
    // Run all count queries in parallel for performance
    const [totalOrders, totalRevenue, activeProducts, lowStockProducts] = await Promise.all([
      getPrismaClient().order.count(),
      getPrismaClient().order.aggregate({
        _sum: {
          total: true
        }
      }),
      getPrismaClient().product.count({
        where: { stock: { gt: 0 } }
      }),
      getPrismaClient().product.count({
        where: { stock: { lte: 10 } }
      }),
      getPrismaClient().user.count()
    ]);

    // Get recent orders for the dashboard widget
    const recentOrders = await getPrismaClient().order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { name: true, email: true }
        }
      }
    });

    res.json({
      totalOrders,
      totalRevenue: totalRevenue._sum.total || 0,
      activeProducts,
      lowStockProducts,
      recentOrders
    });
  } catch (error) {
    logger.error('Failed to fetch admin stats:', error);
    next(error);
  }
});

export default router;
