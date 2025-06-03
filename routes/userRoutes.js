const express = require('express');
const { registerUser, loginUser, logoutUser, getUserProfile } = require('../controllers/userController');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

// Route for user registration
router.post('/register', registerUser);

// Route for user login
router.post('/login', loginUser);

// Route for user logout
router.post('/logout', authMiddleware, logoutUser);

// Route for getting user profile
router.get('/profile', authMiddleware, getUserProfile);

module.exports = router;