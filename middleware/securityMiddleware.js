const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const express = require('express');
const { injectionProtection } = require('./injectionProtection');

// Rate limiting pentru toate requesturile
const generalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minute
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // 100 requests per window
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: Math.ceil((parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000) / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting strict pentru auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minute
  max: 5, // 5 încercări per IP per window
  message: {
    error: 'Too many authentication attempts, please try again later.',
    retryAfter: 900 // 15 minute în secunde
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Nu conta requesturile successful
});

// Rate limiting pentru email verification
const emailLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 oră
  max: 3, // 3 emailuri per IP per oră
  message: {
    error: 'Too many verification emails sent, please try again later.',
    retryAfter: 3600 // 1 oră în secunde
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Security middleware configuration
const securityMiddleware = (app) => {
  // Helmet pentru diverse protecții HTTP
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false
  }));

  // General rate limiting
  app.use(generalLimiter);
  // Data sanitization împotriva NoSQL injection cu îmbunătățiri
  app.use(mongoSanitize({
    replaceWith: '_',
    allowDots: false,
    onSanitize: ({ req, key }) => {
      console.warn(`⚠️  Sanitized key: ${key} in ${req.method} ${req.path}`);
    },
  }));

  // Data sanitization împotriva XSS
  app.use(xss());

  // Previne HTTP Parameter Pollution
  app.use(hpp({
    whitelist: ['search', 'category', 'bloodType', 'sort', 'fields', 'page', 'limit'] // Parametri care pot avea valori multiple
  }));

  // Custom injection protection
  app.use(injectionProtection);
  // Body parser limits
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Security headers
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });
};

module.exports = {
  securityMiddleware,
  authLimiter,
  emailLimiter
};