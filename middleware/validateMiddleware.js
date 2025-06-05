const { body, query, validationResult } = require('express-validator');

// Utility pentru gestionarea erorilor de validare
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg
      }))
    });
  }
  next();
};

// Validare pentru înregistrare
const validateRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-ZăâîșțĂÂÎȘȚ\s-']+$/)
    .withMessage('Name can only contain letters, spaces, hyphens and apostrophes'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address')
    .isLength({ max: 255 })
    .withMessage('Email is too long'),
  
  body('password')
    .isLength({ min: 8, max: 128 })
    .withMessage('Password must be between 8 and 128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, one number and one special character'),
  
  handleValidationErrors
];

// Validare pentru login
const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  handleValidationErrors
];

// Validare pentru resend verification
const validateResendVerification = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  handleValidationErrors
];

// Validare pentru token verification
const validateTokenQuery = [
  query('token')
    .isLength({ min: 32, max: 128 })
    .withMessage('Invalid token format')
    .matches(/^[a-f0-9]+$/)
    .withMessage('Token must be hexadecimal'),
  
  handleValidationErrors
];

// Validare pentru actualizare profil
const validateProfileUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-ZăâîșțĂÂÎȘȚ\s-']+$/)
    .withMessage('Name can only contain letters, spaces, hyphens and apostrophes'),
  
  body('age')
    .optional()
    .isInt({ min: 13, max: 120 })
    .withMessage('Age must be between 13 and 120'),
  
  body('height')
    .optional()
    .isInt({ min: 100, max: 250 })
    .withMessage('Height must be between 100 and 250 cm'),
  
  body('weight')
    .optional()
    .isFloat({ min: 30, max: 300 })
    .withMessage('Weight must be between 30 and 300 kg'),
  
  body('desiredWeight')
    .optional()
    .isFloat({ min: 30, max: 300 })
    .withMessage('Desired weight must be between 30 and 300 kg'),
  
  body('bloodType')
    .optional()
    .isInt({ min: 1, max: 4 })
    .withMessage('Blood type must be 1, 2, 3, or 4'),
  
  handleValidationErrors
];

// Validare pentru căutare produse
const validateProductSearch = [
  query('search')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Search term must be between 2 and 50 characters')
    .matches(/^[a-zA-ZăâîșțĂÂÎȘȚ\s-']+$/)
    .withMessage('Search term can only contain letters, spaces, hyphens and apostrophes'),
  
  handleValidationErrors
];

// Validare pentru diary entry
const validateDiaryEntry = [
  body('productId')
    .isMongoId()
    .withMessage('Invalid product ID'),
  
  body('date')
    .isISO8601()
    .withMessage('Invalid date format')
    .toDate(),
  
  body('grams')
    .isInt({ min: 1, max: 5000 })
    .withMessage('Grams must be between 1 and 5000'),
  
  handleValidationErrors
];

module.exports = {
  validateRegistration,
  validateLogin,
  validateResendVerification,
  validateTokenQuery,
  validateProfileUpdate,
  validateProductSearch,
  validateDiaryEntry,
  handleValidationErrors
};