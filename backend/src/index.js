import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { logger } from './utils/logger.js';

// Import routes
import productRoutes from './routes/products.js';
import authRoutes from './routes/auth.js';
import cartRoutes from './routes/cart.js';
import orderRoutes from './routes/orders.js';
import categoryRoutes from './routes/categories.js';
import adminRoutes from './routes/admin.js';

// Load environment variables
dotenv.config();

// Critical Environment Check
const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  logger.error(`Missing critical environment variables: ${missingEnvVars.join(', ')}`);
  process.exit(1);
}

// Configuration
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Create Express app
const app = express();

/**
 * Security & Proxy Configuration
 * Trust proxy is required when running behind a reverse proxy (like Nginx) or in Docker
 * to correctly identify the client's IP address for rate limiting.
 */
app.set('trust proxy', 1);

/**
 * Global Middleware Registration
 */

// 1. Security Headers
app.use(helmet());

// 2. CORS (Cross-Origin Resource Sharing)
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true, // Allow cookies to be sent
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 3. Request Parsing
app.use(express.json()); // Parse JSON bodies
app.use(cookieParser()); // Parse cookies

// 4. Logging
// Use morgan to log HTTP requests to our winston logger
app.use(morgan('combined', { 
  stream: { write: message => logger.info(message.trim()) },
  skip: (req) => req.url === '/health' // Skip logging for health checks to reduce noise
}));

// 5. Rate Limiting
// Protect API from abuse. Generous limit for dev/testing, stricter for prod can be configured.
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: { error: 'Too many requests, please try again later.' },
  // Skip rate limiting in development if needed, or for specific trusted IPs
  skip: () => NODE_ENV === 'development' // Optional: Skip in dev to prevent blocking during heavy testing
});
app.use('/api', apiLimiter);

/**
 * Route Definitions
 */

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV
  });
});

// API Routes
app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/admin', adminRoutes);

/**
 * Error Handling
 */

// 404 - Not Found Handler
app.use((req, res) => {
  logger.warn(`404 Not Found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    error: 'Resource not found'
  });
});

// Global Error Handler
app.use((err, req, res, _next) => {
  logger.error(`Unhandled Error: ${err.message}`, { stack: err.stack });
  
  const statusCode = err.status || 500;
  const message = NODE_ENV === 'production' 
    ? 'Internal server error' 
    : err.message;

  res.status(statusCode).json({ error: message });
});

// Start Server
app.listen(PORT, () => {
  logger.info(`Server running in ${NODE_ENV} mode on port ${PORT}`);
  logger.info(`Accepting requests from ${FRONTEND_URL}`);
});

export default app;
