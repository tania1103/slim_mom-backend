const express = require('express');
const router = express.Router();
const diaryController = require('../controllers/diaryController');
const authMiddleware = require('../middleware/authMiddleware');

// Adaugă produs la jurnal (privat)
router.post('/add', authMiddleware, diaryController.addProductToDiary);
// Șterge produs din jurnal (privat)
router.post('/delete', authMiddleware, diaryController.removeProductFromDiary);
// Primește toate informațiile despre o zi (privat)
router.get('/:date', authMiddleware, diaryController.getDiaryByDate);

module.exports = router;