import { createClient } from 'redis';
import { logger } from './logger.js';

let redisClient;

export const initializeRedis = async (maxRetries = 5, retryDelay = 2000) => {
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      redisClient = createClient({ url: redisUrl });

      redisClient.on('error', (err) => logger.error('Redis Client Error', err));
      redisClient.on('connect', () => logger.info('Redis Client Connected'));
      redisClient.on('ready', () => logger.info('Redis Client Ready'));

      await redisClient.connect();
      logger.info('Redis initialized successfully');
      return;
    } catch (error) {
      logger.warn(`Redis connection attempt ${attempt}/${maxRetries} failed:`, error.message);
      
      if (attempt === maxRetries) {
        logger.error('Failed to initialize Redis after all retries - proceeding without caching');
        return;
      }
      
      const delay = retryDelay * Math.pow(2, attempt - 1);
      logger.info(`Retrying Redis connection in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

export const getRedisClient = () => redisClient;

export const clearCache = async (pattern) => {
  if (!redisClient || !redisClient.isReady) return;
  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
      logger.info(`Cleared cache for keys matching: ${pattern}`);
    }
  } catch (error) {
    logger.error('Error clearing cache', error);
  }
};
