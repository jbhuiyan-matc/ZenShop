import { getPrisma } from '../utils/database.js';

const getPrismaClient = () => getPrisma();

export const getOrders = async (userId) => {
  return await getPrismaClient().order.findMany({
    where: { userId },
    include: {
      orderItems: {
        include: { product: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
};

export const getOrderById = async (userId, orderId) => {
  const order = await getPrismaClient().order.findUnique({
    where: { id: orderId },
    include: {
      orderItems: {
        include: { product: true }
      }
    }
  });

  if (!order || order.userId !== userId) {
    const error = new Error('Order not found');
    error.status = 404;
    throw error;
  }

  return order;
};

export const createOrder = async (userId, items) => {
  if (!items || !Array.isArray(items) || items.length === 0) {
    const error = new Error('No items provided');
    error.status = 400;
    throw error;
  }

  let total = 0;
  const orderItemsData = [];

  for (const item of items) {
    const product = await getPrismaClient().product.findUnique({ where: { id: item.productId } });
    
    if (!product) {
      const error = new Error(`Product ${item.productId} not found`);
      error.status = 400;
      throw error;
    }
    
    if (product.stock < item.quantity) {
      const error = new Error(`Insufficient stock for ${product.name}`);
      error.status = 400;
      throw error;
    }

    total += Number(product.price) * item.quantity;
    orderItemsData.push({
      productId: product.id,
      quantity: item.quantity,
      price: product.price
    });
  }

  return await getPrismaClient().$transaction(async (tx) => {
    const newOrder = await tx.order.create({
      data: {
        userId,
        total: total,
        status: 'PAID', // Mocking immediate payment success
        orderItems: {
          create: orderItemsData
        }
      },
      include: { orderItems: true }
    });

    for (const item of orderItemsData) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } }
      });
    }

    return newOrder;
  });
};
