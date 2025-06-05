const fs = require('fs');
const path = require('path');

// Creează directorul pentru loguri dacă nu există
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Security event logger
const logSecurityEvent = (eventType, details, req) => {
  const timestamp = new Date().toISOString();
  const ip = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
  const userAgent = req.get('User-Agent') || 'Unknown';
  
  const logEntry = {
    timestamp,
    eventType,
    ip,
    userAgent,
    url: req.originalUrl,
    method: req.method,
    details
  };

  const logLine = JSON.stringify(logEntry) + '\n';
  const logFile = path.join(logsDir, `security-${new Date().toISOString().split('T')[0]}.log`);
  
  fs.appendFile(logFile, logLine, (err) => {
    if (err) console.error('Error writing security log:', err);
  });

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[SECURITY] ${eventType}:`, details);
  }
};

// Middleware pentru logging failed login attempts
const logFailedLogin = (req, res, next) => {
  const originalJson = res.json;
  res.json = function(data) {
    if (res.statusCode === 401 && data.message.includes('credentials')) {
      logSecurityEvent('FAILED_LOGIN', {
        email: req.body.email,
        reason: data.message
      }, req);
    }
    return originalJson.call(this, data);
  };
  next();
};

// Middleware pentru logging suspicious activity
const logSuspiciousActivity = (req, res, next) => {
  const suspiciousPatterns = [
    /script/i,
    /<\s*iframe/i,
    /javascript:/i,
    /vbscript:/i,
    /onload=/i,
    /onerror=/i,
    /eval\(/i,
    /expression\(/i
  ];

  const checkForSuspiciousContent = (obj) => {
    if (typeof obj === 'string') {
      return suspiciousPatterns.some(pattern => pattern.test(obj));
    }
    if (typeof obj === 'object' && obj !== null) {
      return Object.values(obj).some(value => checkForSuspiciousContent(value));
    }
    return false;
  };

  if (checkForSuspiciousContent(req.body) || checkForSuspiciousContent(req.query)) {
    logSecurityEvent('SUSPICIOUS_INPUT', {
      body: req.body,
      query: req.query,
      reason: 'Potential XSS or injection attempt'
    }, req);
  }

  next();
};

// Middleware pentru logging rate limit violations
const logRateLimitViolation = (req, res, next) => {
  const originalJson = res.json;
  res.json = function(data) {
    if (res.statusCode === 429) {
      logSecurityEvent('RATE_LIMIT_VIOLATION', {
        endpoint: req.originalUrl,
        reason: data.error || 'Rate limit exceeded'
      }, req);
    }
    return originalJson.call(this, data);
  };
  next();
};

module.exports = {
  logSecurityEvent,
  logFailedLogin,
  logSuspiciousActivity,
  logRateLimitViolation
};