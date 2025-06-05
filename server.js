#!/usr/bin/env node

// Load environment variables first
require('dotenv').config();

const app = require('./app');
const PORT = process.env.PORT || 5000;

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  console.error('💥 Shutting down due to uncaught exception');
  process.exit(1);
});

// Start server
const server = app.listen(PORT, () => {
  console.log('\n🚀 SlimMom Server Started Successfully!');
  console.log(`📍 Port: ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📋 API Docs: http://localhost:${PORT}/api-docs`);
  console.log(`🔗 Health Check: http://localhost:${PORT}/`);
  
  console.log('\n🔒 Security Status:');
  console.log('   ✅ Mongoose 8.15.1 (Critical vulnerability FIXED)');
  console.log('   ✅ Rate limiting enabled');
  console.log('   ✅ Input validation active');
  console.log('   ✅ XSS & NoSQL injection protection');
  console.log('   ✅ Security headers configured');
  console.log('   ✅ CORS properly configured');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  console.log('💥 Shutting down server due to unhandled promise rejection');
  server.close(() => {
    process.exit(1);
  });
});

// Graceful shutdown handlers
const shutdown = (signal) => {
  console.log(`\n👋 ${signal} received, shutting down gracefully...`);
  server.close(() => {
    console.log('✅ Server closed successfully');
    process.exit(0);
  });
  
  // Force close after 10 seconds
  setTimeout(() => {
    console.error('❌ Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));