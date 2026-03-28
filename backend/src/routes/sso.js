import express from 'express';
import passport from 'passport';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Initiate login - redirect to Authentik
router.get('/login', (req, res, next) => {
  // Check if OIDC is configured
  if (!passport._strategy('oidc')) {
    return res.status(503).json({
      error: 'SSO not configured',
      message: 'Authentik SSO is not configured. Please set AUTHENTIK_ISSUER, AUTHENTIK_CLIENT_ID, and AUTHENTIK_CLIENT_SECRET environment variables.'
    });
  }
  
  // Store the return URL if provided
  if (req.query.returnTo) {
    req.session.returnTo = req.query.returnTo;
  }
  logger.info('SSO login initiated');
  passport.authenticate('oidc')(req, res, next);
});

// Handle callback from Authentik
router.get('/callback',
  passport.authenticate('oidc', { 
    failureRedirect: '/auth/login-failed',
    failureMessage: true
  }),
  (req, res) => {
    logger.info(`SSO login successful for user: ${req.user?.displayName || req.user?.id}`);
    // Redirect to original destination or homepage
    const returnTo = req.session.returnTo || '/';
    delete req.session.returnTo;
    res.redirect(returnTo);
  }
);

// Login failed handler
router.get('/login-failed', (req, res) => {
  logger.warn('SSO login failed');
  res.status(401).json({
    error: 'Authentication failed',
    message: 'Unable to authenticate with SSO provider'
  });
});

// Logout - destroy session and redirect to Authentik logout
router.get('/logout', (req, res, next) => {
  const user = req.user;
  logger.info(`SSO logout for user: ${user?.displayName || user?.id || 'unknown'}`);
  
  req.logout((err) => {
    if (err) {
      logger.error('Logout error:', err);
      return next(err);
    }
    
    req.session.destroy((err) => {
      if (err) {
        logger.error('Session destroy error:', err);
      }
      
      // Redirect to Authentik end session endpoint if configured
      const authentikLogoutUrl = process.env.AUTHENTIK_LOGOUT_URL;
      if (authentikLogoutUrl) {
        res.redirect(authentikLogoutUrl);
      } else {
        res.redirect('/');
      }
    });
  });
});

// Get current user session info
router.get('/me', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({
      authenticated: true,
      user: {
        id: req.user.id,
        displayName: req.user.displayName,
        email: req.user.email,
        username: req.user.username,
        provider: req.user.provider
      }
    });
  } else {
    res.json({
      authenticated: false,
      user: null
    });
  }
});

// Check authentication status
router.get('/status', (req, res) => {
  res.json({
    authenticated: req.isAuthenticated(),
    sessionID: req.sessionID
  });
});

export default router;
