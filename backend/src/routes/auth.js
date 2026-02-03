import express from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { validateRequest } from '../middleware/validate.js';
import { createAuditLog } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';

const router = express.Router();
const prisma = new PrismaClient();

// Validation schemas
const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().optional()
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string()
});

// Register a new user
router.post('/register', validateRequest(registerSchema), async (req, res, next) => {
  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: req.body.email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: req.body.email,
        passwordHash: hashedPassword,
        name: req.body.name,
        role: 'USER'
      }
    });

    // Log the registration
    createAuditLog(user.id, 'USER_REGISTERED', 'User registered successfully', req);

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Return user info (excluding password hash)
    res.status(201).json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      token
    });

  } catch (error) {
    logger.error('Registration error:', error);
    next(error);
  }
});

// Login user
router.post('/login', validateRequest(loginSchema), async (req, res, next) => {
  try {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email: req.body.email }
    });

    // Check if user exists and password is correct
    if (!user || !(await bcrypt.compare(req.body.password, user.passwordHash))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Log the login
    createAuditLog(user.id, 'USER_LOGGED_IN', 'User logged in successfully', req);

    // Return user info (excluding password hash)
    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      token
    });

  } catch (error) {
    logger.error('Login error:', error);
    next(error);
  }
});

// Get current user profile
router.get('/me', async (req, res, next) => {
  try {
    // Check for authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const token = authHeader.split(' ')[1];
    
    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get user from database
      const user = await prisma.user.findUnique({
        where: { id: decoded.id }
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Return user info
      res.json({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      });
    } catch (error) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  } catch (error) {
    logger.error('Get profile error:', error);
    next(error);
  }
});

export default router;
