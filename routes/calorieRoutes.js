const express = require('express');
const { getDailyIntake, addEntry, deleteEntry } = require('../controllers/calorieController');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

// Route for getting daily calorie intake
router.get('/daily/:date', authMiddleware, getDailyIntake);

// Route for adding calorie entry
router.post('/add', authMiddleware, addEntry);

// Route for deleting calorie entry
router.delete('/:date/:productId', authMiddleware, deleteEntry);

module.exports = router;