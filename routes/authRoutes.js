const express = require('express');
const { register, login, logout, refreshToken } = require('../controllers/authController');
const { validateRegistration, validateLogin } = require('../middleware/validateMiddleware');

const router = express.Router();

router.post('/register', validateRegistration, register);
router.post('/login', validateLogin, login);
router.post('/logout', logout);
router.post('/refresh', refreshToken);

module.exports = router;