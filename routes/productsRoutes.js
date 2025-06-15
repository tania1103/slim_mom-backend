const express = require('express');
const { searchProducts, getProductsByBloodType, getAllProducts, getProductById } = require('../controllers/productsController');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

// Public route for basic product search (for non-authenticated users)
router.get('/search/public', searchProducts);

// Public route for getting a few sample products (for testing)
router.get('/sample', getAllProducts);

// Debug route to check database connection and data
router.get('/debug', async (req, res) => {
  try {
    const count = await require('../models/Product').countDocuments();
    const sampleProducts = await require('../models/Product').find().limit(3);
    
    res.json({
      message: 'Database connection OK',
      totalProducts: count,
      sampleProducts: sampleProducts,
      databaseUrl: process.env.MONGODB_URI ? 'Connected to MongoDB Atlas' : 'No MongoDB URI configured'
    });
  } catch (error) {
    res.status(500).json({
      message: 'Database connection failed',
      error: error.message
    });
  }
});

// Route for searching products (authenticated)
router.get('/search', authMiddleware, searchProducts);

// Public route for getting products by blood type (for calculator)
router.get('/blood-type/:bloodType/public', getProductsByBloodType);

// Route for getting products by blood type (authenticated)
router.get('/blood-type/:bloodType', authMiddleware, getProductsByBloodType);

// Route for getting all products
router.get('/', authMiddleware, getAllProducts);

// Route for getting product by ID
router.get('/:id', authMiddleware, getProductById);

module.exports = router;