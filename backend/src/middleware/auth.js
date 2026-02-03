import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger.js';

const prisma = new PrismaClient();

/**
 * Middleware to verify user is authenticated via JWT
 */
export const isAuthenticated = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Set user info on request object
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role
    };

    // Log authentication success (don't include sensitive data)
    logger.info(`User ${user.id} authenticated`);
    
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    logger.error('Authentication error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Middleware to verify user is an admin
 * Must be used after isAuthenticated middleware
 */
export const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Access denied. Admin role required.' });
  }
  
  next();
};

/**
 * Create an audit log entry
 */
export const createAuditLog = async (userId, action, details, req) => {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        details,
        ip: req.ip,
        userAgent: req.headers['user-agent']
      }
    });
  } catch (error) {
    logger.error('Failed to create audit log:', error);
  }
};
