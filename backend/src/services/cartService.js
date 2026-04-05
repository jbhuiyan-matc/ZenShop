import { getPrisma } from '../utils/database.js';

const getPrismaClient = () => getPrisma();

export const getCart = async (userId) => {
  return await getPrismaClient().cartItem.findMany({
    where: { userId },
    include: { product: true }
  });
};

export const addToCart = async (userId, productId, quantity) => {
  if (!productId || !quantity || quantity < 1) {
    const error = new Error('Invalid product or quantity');
    error.status = 400;
    throw error;
  }

  const product = await getPrismaClient().product.findUnique({ where: { id: productId } });
  if (!product) {
    const error = new Error('Product not found');
    error.status = 404;
    throw error;
  }
  if (product.stock < quantity) {
    const error = new Error('Insufficient stock');
    error.status = 400;
    throw error;
  }

  const existingItem = await getPrismaClient().cartItem.findUnique({
    where: {
      userId_productId: {
        userId,
        productId
      }
    }
  });

  if (existingItem) {
    return await getPrismaClient().cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: existingItem.quantity + quantity },
      include: { product: true }
    });
  } else {
    return await getPrismaClient().cartItem.create({
      data: {
        userId,
        productId,
        quantity
      },
      include: { product: true }
    });
  }
};

export const updateCartItem = async (userId, itemId, quantity) => {
  if (!quantity || quantity < 1) {
    const error = new Error('Invalid quantity');
    error.status = 400;
    throw error;
  }

  const item = await getPrismaClient().cartItem.findUnique({ where: { id: itemId } });
  if (!item || item.userId !== userId) {
    const error = new Error('Cart item not found');
    error.status = 404;
    throw error;
  }

  return await getPrismaClient().cartItem.update({
    where: { id: itemId },
    data: { quantity },
    include: { product: true }
  });
};

export const removeCartItem = async (userId, itemId) => {
  const item = await getPrismaClient().cartItem.findUnique({ where: { id: itemId } });
  if (!item || item.userId !== userId) {
    const error = new Error('Cart item not found');
    error.status = 404;
    throw error;
  }

  await getPrismaClient().cartItem.delete({ where: { id: itemId } });
};

export const clearCart = async (userId) => {
  await getPrismaClient().cartItem.deleteMany({
    where: { userId }
  });
};
