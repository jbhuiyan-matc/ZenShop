import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { logger } from './utils/logger.js';
import { initializeRedis } from './utils/redis.js';
import { initializePrisma } from './utils/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// Initialize connections with retry logic
const initializeConnections = async () => {
  await initializePrisma();
  await initializeRedis();
};

initializeConnections().catch((error) => {
  logger.error('Failed to initialize connections:', error);
  process.exit(1);
});

// Trust the reverse proxy (Nginx)
app.set('trust proxy', 1);

const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

/* =========================================
   Global Middleware Configuration
   ========================================= */

// Set security HTTP headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"], // unsafe-inline needed for some dev tools/react
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:", "https://images.unsplash.com", "https://placehold.co", "https://images.pexels.com"],
      connectSrc: ["'self'", "http://localhost:3000", "http://localhost:3001", "http://localhost:3002", "http://localhost:5000", "https://matcsecdesignc.com"],
      fontSrc: ["'self'", "https:", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Enable Cross-Origin Resource Sharing (CORS)
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'https://matcsecdesignc.com'],
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
  max: 1000, // Limit each IP to 1000 requests per window
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

// Root endpoint - ZenShop welcome page
app.get('/', (req, res) => {
  res.status(200).send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>ZenShop - E-Commerce Platform</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; display: flex; align-items: center; justify-content: center; }
        .container { text-align: center; color: white; padding: 2rem; }
        h1 { font-size: 3.5rem; margin-bottom: 1rem; text-shadow: 2px 2px 4px rgba(0,0,0,0.2); }
        .tagline { font-size: 1.25rem; opacity: 0.9; margin-bottom: 2rem; }
        .status { background: rgba(255,255,255,0.15); padding: 1.5rem 2rem; border-radius: 12px; backdrop-filter: blur(10px); }
        .status-badge { display: inline-block; background: #22c55e; color: white; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.875rem; font-weight: 600; margin-bottom: 0.5rem; }
        .endpoints { margin-top: 1rem; font-size: 0.9rem; opacity: 0.8; }
        .endpoints a { color: white; text-decoration: none; margin: 0 0.5rem; }
        .endpoints a:hover { text-decoration: underline; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🛒 ZenShop</h1>
        <p class="tagline">Your Modern E-Commerce Platform</p>
        <div class="status">
          <span class="status-badge">● Online</span>
          <p>Backend API is running and ready to serve requests.</p>
          <div class="endpoints">
            <a href="/health">Health Check</a> |
            <a href="/api/products">Products API</a> |
            <a href="/api/categories">Categories API</a>
          </div>
        </div>
      </div>
    </body>
    </html>
  `);
});

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
   Serve Frontend (Production)
   ========================================= */

if (process.env.NODE_ENV === 'production') {
  const frontendPath = path.join(__dirname, '../../frontend/dist');
  app.use(express.static(frontendPath));
  // SPA fallback — serve index.html for any non-API route
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
}

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
app.use((err, req, res, _next) => {
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

app.listen(3001, "0.0.0.0", () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Frontend URL: ${FRONTEND_URL}`);
});

export default app;
