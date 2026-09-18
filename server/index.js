import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { initDatabase } from './database.js';
import authRouter from './routes/auth.js';
import productsRouter from './routes/products.js';
import categoriesRouter from './routes/categories.js';
import cartRouter from './routes/cart.js';
import ordersRouter from './routes/orders.js';
import paymentsRouter from './routes/payments.js';
import adminRouter from './routes/admin.js';

import addressesRouter from './routes/addresses.js';
import wishlistRouter from './routes/wishlist.js';
import seoRouter from './routes/seo.js';
import { logger } from './utils/logger.js';
import { cacheMiddleware, clearCache } from './middleware/cache.js';
import { seedSupabaseIfEmpty } from './supabase.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Database & Seed
initDatabase();
seedSupabaseIfEmpty();
clearCache('/api/products');

const app = express();
const PORT = process.env.PORT || 5000;

// Basic Security Headers & CORS
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// CORS Configuration for Production Frontend & Local Development
const allowedOrigins = [
  'https://www.goodlucksociety.in',
  'https://goodlucksociety.in',
  'https://goodlucksociety.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5000',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app') || origin.endsWith('.goodlucksociety.in')) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// SEO Routes (Root sitemap.xml and robots.txt)
app.use('/', seoRouter);

// Serve static assets with HTTP Cache headers (7 days)
const staticOptions = {
  maxAge: '7d',
  etag: true,
  lastModified: true
};
app.use(express.static(path.join(__dirname, '../public'), staticOptions));
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads'), staticOptions));

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/products', cacheMiddleware(60), productsRouter);
app.use('/api/categories', cacheMiddleware(120), categoriesRouter);
app.use('/api/cart', cartRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/admin', adminRouter);
app.use('/api/addresses', addressesRouter);
app.use('/api/wishlist', wishlistRouter);

// Root API info & Health check routes
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Good Luck Society API Backend is active ⚡',
    frontend: 'https://www.goodlucksociety.in',
    health: '/api/health'
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Good Luck Society Backend active' });
});

// Central Error Handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'An internal server error occurred.'
  });
});

app.listen(PORT, () => {
  console.log(`⚡ Good Luck Society API Server running on port ${PORT}`);
});
