// Backend/index.js

import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import passport from 'passport';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import connectDB from './config/db.js';
import corsOptions from './config/cors.js';
import configurePassport from './config/passport.js';
import blogRoutes from './routes/blogRoutes.js';

// ============================================
// IMPORT ROUTES
// ============================================
import authRoutes from './routes/authRoutes.js';
import superAdminRoutes from './routes/superAdminRoutes.js';
import sellerRoutes from './routes/sellerRoutes.js';
import bannerRoutes from './routes/bannerRoutes.js';

// ============================================
// IMPORT SERVICES
// ============================================
import superAdminService from './services/superAdminService.js';

// ============================================
// ENVIRONMENT CONFIGURATION
// ============================================
dotenv.config();

// ============================================
// INITIALIZE SUPER ADMIN ON STARTUP
// ============================================
(async () => {
  try {
    console.log('🔧 Initializing Super Admin...');
    await superAdminService.initializeSuperAdmin();
    console.log('✅ Super Admin initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize Super Admin:', error.message);
  }
})();

// ============================================
// CONNECT TO DATABASE
// ============================================
await connectDB();

// ============================================
// CREATE EXPRESS APP
// ============================================
const app = express();

// ============================================
// SECURITY MIDDLEWARE
// ============================================
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginOpenerPolicy: { policy: 'unsafe-none' },
    contentSecurityPolicy: false,
  })
);

// ============================================
// CORS MIDDLEWARE
// ============================================
app.use(cors(corsOptions));

// ============================================
// RATE LIMITING
// ============================================
const limiter = rateLimit({
  windowMs: (process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000,
  max: process.env.RATE_LIMIT_MAX || 1000,
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// ============================================
// BODY PARSING MIDDLEWARE
// ============================================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser(process.env.COOKIE_SECRET));

// ============================================
// SESSION CONFIGURATION (for Passport)
// ============================================
const sessionConfig = {
  secret: process.env.COOKIE_SECRET || 'default-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  },
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    collectionName: 'sessions',
    touchAfter: 24 * 3600,
  }),
};

app.use(session(sessionConfig));

// ============================================
// PASSPORT MIDDLEWARE
// ============================================
app.use(passport.initialize());
app.use(passport.session());
configurePassport();

// ============================================
// LOGGING MIDDLEWARE
// ============================================
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ============================================
// HEALTH CHECK ENDPOINT
// ============================================
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    uptime: process.uptime(),
    mongodb: 'connected',
  });
});

// ============================================
// API INFO ENDPOINT
// ============================================
app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Aurevian Collections API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      superAdmin: '/api/super-admin',
      seller: '/api/seller',
      blog: '/api/blog',
      banners: '/api/banners',
      health: '/health'
    },
    documentation: 'Contact support for API documentation'
  });
});

// ============================================
// API ROUTES
// ============================================
console.log('\n🔗 Registering routes:');
console.log('  📌 /api/auth - Authentication routes');
console.log('  📌 /api/super-admin - Super Admin routes');
console.log('  📌 /api/seller - Seller routes');
console.log('  📌 /api/banners - Banner Management routes');

app.use('/api/auth', authRoutes);
app.use('/api/super-admin', superAdminRoutes);
app.use('/api/seller', sellerRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/blog', blogRoutes);

// ============================================
// 404 NOT FOUND HANDLER
// ============================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl,
  });
});

// ============================================
// GLOBAL ERROR HANDLER
// ============================================
app.use((err, req, res, next) => {
  console.error('❌ Global Error:', err.message);
  console.error('Stack:', err.stack);

  // MongoDB duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(409).json({
      success: false,
      message: `Duplicate value for ${field}. Please use a different ${field}.`,
    });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: messages,
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired',
    });
  }

  // Multer errors
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 10MB.',
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected file field.',
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files.',
      });
    }
    return res.status(400).json({
      success: false,
      message: `Upload error: ${err.message}`,
    });
  }

  // Cloudinary errors
  if (err.message && err.message.includes('Cloudinary')) {
    return res.status(500).json({
      success: false,
      message: 'Image upload service error. Please try again.',
      error: err.message,
    });
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// ============================================
// START SERVER
// ============================================
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 Server Started Successfully');
  console.log('='.repeat(60));
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Port: ${PORT}`);
  console.log(`🔗 Client URL: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
  console.log(`🔑 Google OAuth: ${process.env.GOOGLE_CLIENT_ID ? '✅ Configured' : '❌ Not configured'}`);
  console.log(`🔐 JWT Secret: ${process.env.JWT_ACCESS_SECRET ? '✅ Configured' : '❌ Not configured'}`);
  console.log(`📊 MongoDB: ${process.env.MONGODB_URI ? '✅ Configured' : '❌ Not configured'}`);
  console.log(`📧 Email Service: ${process.env.EMAIL_USER ? '✅ Configured' : '❌ Not configured'}`);
  console.log(`📱 Twilio Service: ${process.env.TWILIO_ACCOUNT_SID ? '✅ Configured' : '❌ Not configured'}`);
  console.log(`☁️ Cloudinary: ${process.env.CLOUDINARY_CLOUD_NAME ? '✅ Configured' : '❌ Not configured'}`);
  console.log('='.repeat(60));
  console.log('📌 Available Routes:');
  console.log('  🔹 /api/auth - Authentication');
  console.log('  🔹 /api/super-admin - Super Admin');
  console.log('  🔹 /api/seller - Seller');
  console.log('  🔹 /api/banners - Banner Management');
  console.log('  🔹 /health - Health Check');
  console.log('  🔹 /api - API Info');
  console.log('='.repeat(60));
  console.log('  📌 /api/blog - Blog Management');

});

// ============================================
// GRACEFUL SHUTDOWN
// ============================================

process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
  server.close(() => {
    console.log('💤 Server closed due to unhandled rejection');
    process.exit(1);
  });
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  server.close(() => {
    console.log('💤 Server closed due to uncaught exception');
    process.exit(1);
  });
});

process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received. Closing server...');
  server.close(() => {
    console.log('💤 Server closed gracefully');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\n👋 SIGINT received. Closing server...');
  server.close(() => {
    console.log('💤 Server closed gracefully');
    process.exit(0);
  });
});

export default app;