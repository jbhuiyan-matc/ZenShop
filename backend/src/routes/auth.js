import express from 'express';
import { z } from 'zod';
import { validateRequest } from '../middleware/validate.js';
import { isAuthenticated } from '../middleware/auth.js';
import * as authController from '../controllers/authController.js';

const router = express.Router();

// Validation Schemas
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters')
});

const registerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters')
});

/**
 * POST /api/auth/login
 * Authenticates a user and returns a JWT token.
 */
router.post('/login', validateRequest(loginSchema), authController.login);

/**
 * POST /api/auth/register
 * Registers a new user.
 */
router.post('/register', validateRequest(registerSchema), authController.register);

/**
 * GET /api/auth/me
 * Retrieves the current authenticated user's profile.
 */
router.get('/me', isAuthenticated, authController.getProfile);

export default router;
