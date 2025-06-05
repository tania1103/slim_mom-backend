const mongoSanitize = require('express-mongo-sanitize');

// Middleware pentru protecție completă împotriva injection
const injectionProtection = (req, res, next) => {
  // Sanitize MongoDB queries
  mongoSanitize.sanitize(req.body);
  mongoSanitize.sanitize(req.query);
  mongoSanitize.sanitize(req.params);
  
  // Additional validation for search parameters
  if (req.query.search && typeof req.query.search === 'string') {
    // Remove potential regex injection patterns
    req.query.search = req.query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // Limit search length
    if (req.query.search.length > 100) {
      return res.status(400).json({ 
        message: 'Search query too long. Maximum 100 characters.' 
      });
    }
  }
  
  // Validate ObjectId parameters
  if (req.params.id && !/^[0-9a-fA-F]{24}$/.test(req.params.id)) {
    return res.status(400).json({ 
      message: 'Invalid ID format' 
    });
  }
  
  next();
};

module.exports = { injectionProtection };