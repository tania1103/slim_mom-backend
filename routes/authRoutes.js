const express = require('express');
const { register, verifyEmail, resendVerification, login, logout, refreshToken } = require('../controllers/authController');
const { validateRegistration, validateLogin, validateResendVerification, validateTokenQuery } = require('../middleware/validateMiddleware');
const { authLimiter, emailLimiter } = require('../middleware/securityMiddleware');

const router = express.Router();

// Auth routes with specific rate limiting and validation
router.post('/register', authLimiter, validateRegistration, register);
router.get('/verify-email', validateTokenQuery, verifyEmail);
router.post('/resend-verification', emailLimiter, validateResendVerification, resendVerification);
router.post('/login', authLimiter, validateLogin, login);
router.post('/logout', logout);
router.post('/refresh', refreshToken);

module.exports = router;