import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './config/db.js';
import authRoutes from './routes/auth.js';
import categoryRoutes from './routes/categories.js';
import expenseRoutes from './routes/expenses.js';
import analyticsRoutes from './routes/analytics.js';
import userRoutes from './routes/users.js';

// Load .env.local first, then fallback to .env
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const app = express();
const PORT = process.env.PORT || 5000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors({ 
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.CLIENT_URL || false 
    : 'http://localhost:5173', 
  credentials: true 
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist', 'index.html'));
  });
}

// Connect to DB and start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}).catch((err) => {
  console.error('Failed to connect to MongoDB:', err.message);
  process.exit(1);
});
