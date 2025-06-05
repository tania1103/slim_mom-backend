const mongoose = require('mongoose');
const { getCacheStats } = require('./cache');

// System health monitoring
class HealthMonitor {
  constructor() {
    this.startTime = Date.now();
    this.requestCount = 0;
    this.errorCount = 0;
  }

  // Increment request counter
  incrementRequest() {
    this.requestCount++;
  }

  // Increment error counter
  incrementError() {
    this.errorCount++;
  }

  // Get uptime in seconds
  getUptime() {
    return Math.floor((Date.now() - this.startTime) / 1000);
  }

  // Get memory usage
  getMemoryUsage() {
    const usage = process.memoryUsage();
    return {
      rss: Math.round(usage.rss / 1024 / 1024), // MB
      heapTotal: Math.round(usage.heapTotal / 1024 / 1024), // MB
      heapUsed: Math.round(usage.heapUsed / 1024 / 1024), // MB
      external: Math.round(usage.external / 1024 / 1024), // MB
    };
  }

  // Check database connection
  async checkDatabase() {
    try {
      const state = mongoose.connection.readyState;
      const states = {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting'
      };
      
      return {
        status: states[state] || 'unknown',
        connected: state === 1,
        host: mongoose.connection.host,
        port: mongoose.connection.port,
        name: mongoose.connection.name
      };
    } catch (error) {
      return {
        status: 'error',
        connected: false,
        error: error.message
      };
    }
  }

  // Get comprehensive health status
  async getHealthStatus() {
    const memory = this.getMemoryUsage();
    const database = await this.checkDatabase();
    const cacheStats = getCacheStats();
    
    return {
      status: database.connected ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: this.getUptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      node: process.version,
      requests: {
        total: this.requestCount,
        errors: this.errorCount,
        errorRate: this.requestCount > 0 ? (this.errorCount / this.requestCount * 100).toFixed(2) : 0
      },
      memory,
      database,
      cache: cacheStats,
      mongoose: mongoose.version
    };
  }
}

// Create global health monitor instance
const healthMonitor = new HealthMonitor();

// Request monitoring middleware
const requestMonitoringMiddleware = (req, res, next) => {
  healthMonitor.incrementRequest();
  
  // Monitor response for errors
  const originalSend = res.send;
  res.send = function(data) {
    if (res.statusCode >= 400) {
      healthMonitor.incrementError();
    }
    return originalSend.call(this, data);
  };
  
  next();
};

// Health check endpoint handler
const healthCheckHandler = async (req, res) => {
  try {
    const health = await healthMonitor.getHealthStatus();
    const statusCode = health.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(health);
  } catch (error) {
    res.status(503).json({
      status: 'error',
      message: 'Health check failed',
      error: error.message
    });
  }
};

// Detailed health check for admin/monitoring
const detailedHealthHandler = async (req, res) => {
  try {
    const health = await healthMonitor.getHealthStatus();
    
    // Add more detailed information
    const detailed = {
      ...health,
      system: {
        platform: process.platform,
        arch: process.arch,
        cpuUsage: process.cpuUsage(),
        pid: process.pid,
        ppid: process.ppid
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        port: process.env.PORT,
        mongoUri: process.env.MONGODB_URI ? '***configured***' : 'not configured',
        jwtSecret: process.env.JWT_SECRET ? '***configured***' : 'not configured'
      }
    };
    
    res.json(detailed);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Detailed health check failed',
      error: error.message
    });
  }
};

module.exports = {
  healthMonitor,
  requestMonitoringMiddleware,
  healthCheckHandler,
  detailedHealthHandler
};