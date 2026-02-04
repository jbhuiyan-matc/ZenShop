import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger.js';

const prisma = new PrismaClient();

/**
 * Middleware: isAuthenticated
 * 
 * Verifies that the incoming request has a valid JWT token in the Authorization header.
 * If valid, it attaches the user object to `req.user`.
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const isAuthenticated = async (req, res, next) => {
  try {
    // 1. Check for Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logger.warn('Authentication failed: Missing or invalid Authorization header');
      return res.status(401).json({ error: 'Authentication required. Please provide a valid token.' });
    }

    // 2. Extract token
    const token = authHeader.split(' ')[1];
    
    // 3. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 4. Check if user still exists in the database
    // This prevents access if a user is deleted but their token is still valid
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, role: true } // Only select necessary fields
    });

    if (!user) {
      logger.warn(`Authentication failed: User ID ${decoded.id} not found in database`);
      return res.status(401).json({ error: 'User no longer exists.' });
    }

    // 5. Attach user to request object
    req.user = user;

    // Log success (debug level to reduce noise in production)
    logger.debug(`User authenticated: ${user.id} (${user.email})`);
    
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      logger.warn(`Authentication failed: Invalid token - ${error.message}`);
      return res.status(401).json({ error: 'Invalid or expired token.' });
    }
    
    if (error instanceof jwt.TokenExpiredError) {
      logger.warn('Authentication failed: Token expired');
      return res.status(401).json({ error: 'Token has expired. Please login again.' });
    }

    logger.error('Unexpected authentication error:', error);
    return res.status(500).json({ error: 'Internal authentication error.' });
  }
};

/**
 * Middleware: isAdmin
 * 
 * Checks if the authenticated user has the 'ADMIN' role.
 * MUST be placed after `isAuthenticated` middleware.
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const isAdmin = (req, res, next) => {
  if (!req.user) {
    logger.error('Authorization error: isAdmin middleware called without authentication');
    return res.status(500).json({ error: 'Server configuration error.' });
  }

  if (req.user.role !== 'ADMIN') {
    logger.warn(`Access denied: User ${req.user.id} attempted to access admin resource`);
    return res.status(403).json({ error: 'Access denied. Administrator privileges required.' });
  }
  
  next();
};

/**
 * Helper: createAuditLog
 * 
 * Records sensitive actions for security auditing.
 * 
 * @param {string} userId - ID of the user performing the action
 * @param {string} action - Description of the action (e.g., 'DELETE_PRODUCT')
 * @param {Object} details - Additional metadata about the action
 * @param {Object} req - Express request object (to extract IP and User-Agent)
 */
export const createAuditLog = async (userId, action, details, req) => {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        details: typeof details === 'string' ? details : JSON.stringify(details),
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.headers['user-agent'] || 'Unknown'
      }
    });
    logger.info(`Audit Log: ${action} by User ${userId}`);
  } catch (error) {
    // We don't want to fail the request if audit logging fails, but we should log the error
    logger.error('Failed to create audit log:', error);
  }
};
