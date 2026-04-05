import { getPrisma } from '../utils/database.js';

const getPrismaClient = () => getPrisma();

export const getAllCategories = async () => {
  return await getPrismaClient().category.findMany({
    include: {
      _count: {
        select: { products: true }
      }
    },
    orderBy: { name: 'asc' }
  });
};

export const getCategoryById = async (id) => {
  const category = await getPrismaClient().category.findUnique({
    where: { id },
    include: {
      products: {
        select: {
          id: true,
          name: true,
          price: true,
          imageUrl: true,
          stock: true,
          description: true
        }
      }
    }
  });

  if (!category) {
    const error = new Error('Category not found');
    error.status = 404;
    throw error;
  }
  return category;
};

export const createCategory = async (data) => {
  try {
    return await getPrismaClient().category.create({ data });
  } catch (error) {
    if (error.code === 'P2002') {
      const customError = new Error('Category with this name already exists');
      customError.status = 409;
      throw customError;
    }
    throw error;
  }
};

export const updateCategory = async (id, data) => {
  const existingCategory = await getPrismaClient().category.findUnique({ where: { id } });
  if (!existingCategory) {
    const error = new Error('Category not found');
    error.status = 404;
    throw error;
  }

  try {
    return await getPrismaClient().category.update({
      where: { id },
      data
    });
  } catch (error) {
    if (error.code === 'P2002') {
      const customError = new Error('Category with this name already exists');
      customError.status = 409;
      throw customError;
    }
    throw error;
  }
};

export const deleteCategory = async (id) => {
  const existingCategory = await getPrismaClient().category.findUnique({ where: { id } });
  if (!existingCategory) {
    const error = new Error('Category not found');
    error.status = 404;
    throw error;
  }

  try {
    return await getPrismaClient().category.delete({ where: { id } });
  } catch (error) {
    if (error.code === 'P2003') {
      const customError = new Error('Cannot delete category containing products. Please reassign or delete products first.');
      customError.status = 400;
      throw customError;
    }
    throw error;
  }
};
