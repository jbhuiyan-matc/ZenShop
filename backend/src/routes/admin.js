import express from 'express';
import { PrismaClient } from '@prisma/client';
import { isAuthenticated, isAdmin } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';

const router = express.Router();
const prisma = new PrismaClient();

// Get dashboard stats
router.get('/stats', isAuthenticated, isAdmin, async (req, res, next) => {
  try {
    const [totalOrders, totalRevenue, activeProducts, lowStockProducts] = await Promise.all([
      prisma.order.count(),
      prisma.order.aggregate({
        _sum: {
          total: true
        }
      }),
      prisma.product.count({
        where: { stock: { gt: 0 } }
      }),
      prisma.product.count({
        where: { stock: { lte: 10 } }
      })
    ]);

    // Get recent orders
    const recentOrders = await prisma.order.findMany({
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
    logger.error('Error fetching admin stats:', error);
    next(error);
  }
});

export default router;
