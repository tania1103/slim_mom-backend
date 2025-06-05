const express = require('express');
const { addToDiary, getDiaryByDate, deleteDiaryEntry, getAllDiaryEntries } = require('../controllers/diaryController');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

// Route for adding product to diary
router.post('/add', authMiddleware, addToDiary);

// Route for getting diary entries by date
router.get('/:date', authMiddleware, getDiaryByDate);

// Route for getting all diary entries
router.get('/', authMiddleware, getAllDiaryEntries);

// Route for deleting diary entry
router.delete('/:entryId', authMiddleware, deleteDiaryEntry);

module.exports = router;