import { PrismaClient } from '@prisma/client';
import { logger } from './logger.js';

let prisma;

export const initializePrisma = async (maxRetries = 5, retryDelay = 2000) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      prisma = new PrismaClient({
        log: ['error', 'warn'],
      });

      await prisma.$connect();
      logger.info('Database connection established successfully');
      return prisma;
    } catch (error) {
      logger.warn(`Database connection attempt ${attempt}/${maxRetries} failed:`, error.message);
      
      if (attempt === maxRetries) {
        logger.error('Failed to connect to database after all retries');
        throw new Error('Database connection failed after maximum retries');
      }
      
      const delay = retryDelay * Math.pow(2, attempt - 1);
      logger.info(`Retrying database connection in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

export const getPrisma = () => {
  if (!prisma) {
    throw new Error('Prisma client not initialized. Call initializePrisma first.');
  }
  return prisma;
};

export const closePrisma = async () => {
  if (prisma) {
    await prisma.$disconnect();
    logger.info('Database connection closed');
  }
};
