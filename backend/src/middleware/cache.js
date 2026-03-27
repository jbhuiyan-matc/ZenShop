import { getRedisClient } from '../utils/redis.js';
import { logger } from '../utils/logger.js';

export const cacheMiddleware = (duration = 3600) => {
  return async (req, res, next) => {
    const redisClient = getRedisClient();
    
    // If Redis is not connected or request is not GET, skip caching
    if (!redisClient || !redisClient.isReady || req.method !== 'GET') {
      return next();
    }

    // Construct a unique cache key based on URL and query params
    const key = `cache:${req.originalUrl}`;

    try {
      const cachedData = await redisClient.get(key);

      if (cachedData) {
        logger.debug(`Cache hit for ${key}`);
        return res.json(JSON.parse(cachedData));
      }

      logger.debug(`Cache miss for ${key}`);

      // Overwrite res.json to intercept the response and cache it
      const originalJson = res.json.bind(res);
      
      res.json = (body) => {
        // Only cache successful responses
        if (res.statusCode >= 200 && res.statusCode < 300) {
          redisClient.setEx(key, duration, JSON.stringify(body))
            .catch(err => logger.error(`Redis setEx error for ${key}:`, err));
        }
        
        return originalJson(body);
      };

      next();
    } catch (error) {
      logger.error(`Cache middleware error for ${key}:`, error);
      next(); // Proceed without caching on error
    }
  };
};
