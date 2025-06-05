const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const compression = require('compression');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

// Load environment variables
dotenv.config();

// Import security middleware
const { securityMiddleware } = require('./middleware/securityMiddleware');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const productsRoutes = require('./routes/productsRoutes');
const diaryRoutes = require('./routes/diaryRoutes');
const calorieRoutes = require('./routes/calorieRoutes');

const app = express();

// Performance monitoring middleware
app.use((req, res, next) => {
  req.startTime = Date.now();
  const originalSend = res.send;
  
  res.send = function(data) {
    const duration = Date.now() - req.startTime;
    if (duration > 1000) {
      console.warn(`⚠️  Slow request: ${req.method} ${req.path} - ${duration}ms`);
    }
    return originalSend.call(this, data);
  };
  
  next();
});

// Compression middleware for better performance
app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  level: 6,
  threshold: 1024
}));

// Apply security middleware FIRST
securityMiddleware(app);

// Configure CORS
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000',
      'https://tania1103.github.io',
      'https://slimmom-frontend.netlify.app',
      'https://slimmom-frontend.vercel.app'
    ];
    
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      console.warn(`❌ CORS blocked origin: ${origin}`);
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400 // 24 hours
};

app.use(cors(corsOptions));

// MongoDB connection for Mongoose 8.x
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// Import monitoring and logging
const { requestLogger } = require('./middleware/logger');
const { requestMonitoringMiddleware, healthCheckHandler, detailedHealthHandler } = require('./middleware/monitoring');

// Apply monitoring middleware
app.use(requestLogger);
app.use(requestMonitoringMiddleware);

// Health check routes
app.get('/health', healthCheckHandler);
app.get('/health/detailed', detailedHealthHandler);

// Main health check route
app.get('/', (req, res) => {
  res.json({ 
    message: 'SlimMom API is running!',
    version: '2.0.0',
    security: 'HIGH',
    mongoose: mongoose.version,
    status: 'healthy',
    documentation: '/api-docs',
    health: '/health'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', userRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/diary', diaryRoutes);
app.use('/api/calories', calorieRoutes);

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('❌ Global Error:', err.stack);
  
  // Log security-related errors
  if (err.name === 'ValidationError' || err.name === 'CastError') {
    return res.status(400).json({ 
      message: 'Invalid input data',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Validation failed'
    });
  }
  
  res.status(500).json({ 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 Handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    message: 'Route not found',
    path: req.originalUrl,
    method: req.method
  });
});

module.exports = app;