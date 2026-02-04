import express from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { validateRequest } from '../middleware/validate.js';
import { logger } from '../utils/logger.js';

const router = express.Router();
const prisma = new PrismaClient();

// Validation Schemas
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

const registerSchema = z.object({
  name: z.string().min(2, 'Name is too short'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

/**
 * POST /api/auth/login
 * Authenticates a user and returns a JWT token.
 */
router.post('/login', validateRequest(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // In a real app, verify password hash. For now, this is a placeholder.
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1h' }
    );

    logger.info(`User logged in: ${email}`);
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (error) {
    logger.error('Login error:', error);
    next(error);
  }
});

/**
 * POST /api/auth/register
 * Registers a new user.
 */
router.post('/register', validateRequest(registerSchema), async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: 'Email already in use' });
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password, // Note: In production, hash this password!
        role: 'CUSTOMER'
      }
    });

    logger.info(`New user registered: ${email}`);
    res.status(201).json({ message: 'Registration successful', userId: user.id });
  } catch (error) {
    logger.error('Registration error:', error);
    next(error);
  }
});

export default router;
