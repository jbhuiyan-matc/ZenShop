import { getPrisma } from '../utils/database.js';

const getPrismaClient = () => getPrisma();

export const getStats = async () => {
  const [totalOrders, totalRevenue, activeProducts, lowStockProducts, userCount] = await Promise.all([
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

  const recentOrders = await getPrismaClient().order.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: { name: true, email: true }
      }
    }
  });

  return {
    totalOrders,
    totalRevenue: totalRevenue._sum.total || 0,
    activeProducts,
    lowStockProducts,
    userCount,
    recentOrders
  };
};
