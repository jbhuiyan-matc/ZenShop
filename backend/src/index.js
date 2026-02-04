import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { logger } from './utils/logger.js';

// Import route handlers
import productRoutes from './routes/products.js';
import authRoutes from './routes/auth.js';
import cartRoutes from './routes/cart.js';
import orderRoutes from './routes/orders.js';
import categoryRoutes from './routes/categories.js';
import adminRoutes from './routes/admin.js';

// Load environment variables
dotenv.config();

// Initialize Express application
const app = express();

// Trust the reverse proxy (Nginx)
app.set('trust proxy', 1);

const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

/* =========================================
   Global Middleware Configuration
   ========================================= */

// Set security HTTP headers
app.use(helmet());

// Enable Cross-Origin Resource Sharing (CORS)
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true, // Allow cookies to be sent across domains
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse JSON request bodies
app.use(express.json());

// Parse cookies from request headers
app.use(cookieParser());

// HTTP request logging
// We use a custom stream to pipe logs to our Winston logger
app.use(morgan('combined', { 
  stream: { write: message => logger.info(message.trim()) } 
}));

/* =========================================
   Rate Limiting Strategy
   ========================================= */
// Protects the API from brute-force attacks and abuse
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minute window
  max: 100, // Limit each IP to 100 requests per window
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    error: 'Too many requests',
    message: 'You have exceeded the request limit. Please try again later.'
  }
});

// Apply rate limiting to all API routes
app.use('/api', apiLimiter);

/* =========================================
   Route Definitions
   ========================================= */

// Health check endpoint for monitoring
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API Routes
app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/admin', adminRoutes);

/* =========================================
   Error Handling
   ========================================= */

// 404 Handler for undefined routes
app.use((req, res) => {
  logger.warn(`404 - Not Found - ${req.originalUrl} - ${req.method} - ${req.ip}`);
  res.status(404).json({
    error: 'Resource not found',
    path: req.originalUrl
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  logger.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
  
  // Send a generic message in production, detailed error in development
  const errorMessage = process.env.NODE_ENV === 'production' 
    ? 'Internal server error' 
    : err.message;

  res.status(err.status || 500).json({
    error: errorMessage,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

/* =========================================
   Server Startup
   ========================================= */

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Frontend URL: ${FRONTEND_URL}`);
});

export default app;
