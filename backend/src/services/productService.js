import { getPrisma } from '../utils/database.js';

const getPrismaClient = () => getPrisma();

export const getAllProducts = async (categoryId, search) => {
  const where = {};

  if (categoryId) {
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(categoryId);
    
    if (isUUID) {
      where.categoryId = categoryId;
    } else {
      const category = await getPrismaClient().category.findFirst({
        where: { name: { equals: categoryId, mode: 'insensitive' } }
      });

      if (category) {
        where.categoryId = category.id;
      } else {
        where.categoryId = '00000000-0000-0000-0000-000000000000';
      }
    }
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } }
    ];
  }

  return await getPrismaClient().product.findMany({
    where,
    orderBy: { createdAt: 'desc' }
  });
};

export const getProductById = async (id) => {
  const product = await getPrismaClient().product.findUnique({ where: { id } });
  if (!product) {
    const error = new Error('Product not found');
    error.status = 404;
    throw error;
  }
  return product;
};

export const createProduct = async (data) => {
  return await getPrismaClient().product.create({ data });
};

export const updateProduct = async (id, data) => {
  const existingProduct = await getPrismaClient().product.findUnique({ where: { id } });
  if (!existingProduct) {
    const error = new Error('Product not found');
    error.status = 404;
    throw error;
  }

  return await getPrismaClient().product.update({
    where: { id },
    data
  });
};

export const deleteProduct = async (id) => {
  const existingProduct = await getPrismaClient().product.findUnique({ where: { id } });
  if (!existingProduct) {
    const error = new Error('Product not found');
    error.status = 404;
    throw error;
  }

  return await getPrismaClient().product.delete({ where: { id } });
};
