// server.js
import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import initializeDatabase from './config/initializeDatabase.js';
import authRoutes from './routes/auth.js';
import resumeRoutes from './routes/resume.js';
import interviewRoutes from './routes/interviews.js';
import systemRoutes from './routes/system.js';
import profileRoutes from './routes/profile.js';
import { sanitizeInput, securityHeaders, requestId, requestLogger } from './middleware/security.js';

// Load environment variables
dotenv.config();

// --- Initialize MongoDB ---
const initializeApp = async () => {
  try {
    await connectDB();
    if (process.env.NODE_ENV !== 'test') {
      await initializeDatabase();
    }
    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize application:', error.message);
    process.exit(1);
  }
};
initializeApp();

const app = express();
const PORT = process.env.PORT || 3000;

// --- Security Middleware ---
app.use(helmet({ crossOriginResourcePolicy: false })); // avoid blocking CORS headers
app.use(requestId);
app.use(requestLogger);
app.use(securityHeaders);
app.use(sanitizeInput);

// --- Rate Limiting ---
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests, try again later.'
    }
  },
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

// --- CORS Middleware ---
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'https://udaan-ai.web.app'
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  // Preflight handling
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});

// --- Body Parsing ---
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// --- Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/system', systemRoutes);
app.use('/api/profile', profileRoutes);

// --- Health Check ---
app.get('/api/health', async (req, res) => {
  try {
    const mongoose = await import('mongoose');
    const dbStatus = mongoose.default.connection.readyState === 1 ? 'connected' : 'disconnected';
    res.status(200).json({
      success: true,
      message: 'Udaan AI Backend running',
      status: 'healthy',
      database: dbStatus,
      uptime: process.uptime(),
      version: '1.0.0'
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      message: 'Health check failed',
      status: 'unhealthy',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// --- Error Handling ---
app.use((err, req, res, next) => {
  console.error('Error:', err);

  if (err.name === 'ValidationError') {
    return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: err.message } });
  }
  if (err.name === 'CastError') {
    return res.status(400).json({ success: false, error: { code: 'INVALID_ID', message: 'Invalid ID format' } });
  }

  res.status(err.status || 500).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    }
  });
});

// --- 404 Handler ---
app.use('*', (req, res) => {
  console.log(`404: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ success: false, message: 'Route not found' });
});

// --- Server Start ---
const server = app.listen(PORT, async () => {
  console.log(`🚀 Udaan AI running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);

  try {
    const { default: aiService } = await import('./services/aiService.js');
    const { default: enhancedAIErrorHandler } = await import('./services/AIErrorHandlingService.js');

    console.log('🤖 Initializing AI service...');
    await aiService.initialize();
    console.log('✅ AI service ready');
    enhancedAIErrorHandler.startMonitoring();
  } catch (error) {
    console.error('⚠️ AI service init failed:', error.message);
  }
});

// --- Graceful Shutdown ---
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => process.exit(0));
});
process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => process.exit(0));
});
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', promise, 'reason:', reason);
  process.exit(1);
});
