import { logger } from '../utils/logger.js';

// Middleware to require SSO authentication
export const requireSSOAuth = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  
  logger.warn(`Unauthorized access attempt to ${req.originalUrl}`);
  
  // For API requests, return JSON error
  if (req.originalUrl.startsWith('/api/')) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication required. Please login via /auth/login'
    });
  }
  
  // For browser requests, redirect to login
  res.redirect(`/auth/login?returnTo=${encodeURIComponent(req.originalUrl)}`);
};

// Middleware to optionally attach user if authenticated
export const optionalSSOAuth = (req, res, next) => {
  // User is already attached by passport if authenticated
  // This middleware just ensures the route continues regardless
  next();
};

// Middleware to require specific roles (for future use)
export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required'
      });
    }
    
    const userRoles = req.user.roles || [];
    const hasRole = roles.some(role => userRoles.includes(role));
    
    if (!hasRole) {
      logger.warn(`Access denied for user ${req.user.id} - required roles: ${roles.join(', ')}`);
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Insufficient permissions'
      });
    }
    
    next();
  };
};

export default { requireSSOAuth, optionalSSOAuth, requireRole };
