import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger.js';

const prisma = new PrismaClient();

/**
 * Middleware: isAuthenticated
 * 
 * Verifies that the request contains a valid JWT token in the Authorization header.
 * Populates `req.user` with the authenticated user's details.
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const isAuthenticated = async (req, res, next) => {
  try {
    // 1. Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logger.warn(`Authentication failed: No token provided from IP ${req.ip}`);
      return res.status(401).json({ error: 'Authentication required. Please provide a valid token.' });
    }

    const token = authHeader.split(' ')[1];
    
    // 2. Verify JWT signature and expiration
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 3. Retrieve user from database to ensure they still exist and have access
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, role: true } // Only select necessary fields
    });

    if (!user) {
      logger.warn(`Authentication failed: User ID ${decoded.id} not found`);
      return res.status(401).json({ error: 'User account no longer exists.' });
    }

    // 4. Attach user context to request
    req.user = user;

    // Log success (debug level to avoid clutter)
    logger.debug(`User authenticated: ${user.email} (${user.role})`);
    
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      logger.warn(`Authentication failed: Invalid token from IP ${req.ip}`);
      return res.status(401).json({ error: 'Invalid or expired session token.' });
    }
    
    logger.error('Unexpected authentication error:', error);
    return res.status(500).json({ error: 'Internal authentication service error.' });
  }
};

/**
 * Middleware: isAdmin
 * 
 * Checks if the authenticated user has the 'ADMIN' role.
 * Assumes `isAuthenticated` has already run and populated `req.user`.
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const isAdmin = (req, res, next) => {
  if (!req.user) {
    logger.error('isAdmin middleware called without prior authentication.');
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
  } catch (error) {
    // We log the error but don't crash the request if audit logging fails
    logger.error('Failed to create audit log:', error);
  }
};
