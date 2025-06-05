const express = require('express');
const { searchProducts, getProductsByBloodType, getAllProducts, getProductById } = require('../controllers/productsController');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

// Route for searching products
router.get('/search', authMiddleware, searchProducts);

// Route for getting products by blood type
router.get('/blood-type/:bloodType', authMiddleware, getProductsByBloodType);

// Route for getting all products
router.get('/', authMiddleware, getAllProducts);

// Route for getting product by ID
router.get('/:id', authMiddleware, getProductById);

module.exports = router;