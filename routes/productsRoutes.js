const express = require('express');
const router = express.Router();
const productsController = require('../controllers/productsController');
const authMiddleware = require('../middleware/authMiddleware');

// Endpoint public
router.post('/public/daily', productsController.getDailyInfoPublic);
// Endpoint privat
router.post('/private/daily', authMiddleware, productsController.getDailyInfoPrivate);
// Căutare produse
router.get('/search', productsController.searchProducts);

module.exports = router;