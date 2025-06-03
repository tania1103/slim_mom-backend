const express = require('express');
const { 
    getAllProducts, 
    getProductById, 
    addProduct, 
    updateProduct, 
    deleteProduct 
} = require('../controllers/productsController');

const router = express.Router();

// @route   GET /api/products
// @desc    Get all products
router.get('/', getAllProducts);

// @route   GET /api/products/:id
// @desc    Get product by ID
router.get('/:id', getProductById);

// @route   POST /api/products
// @desc    Add a new product
router.post('/', addProduct);

// @route   PUT /api/products/:id
// @desc    Update a product
router.put('/:id', updateProduct);

// @route   DELETE /api/products/:id
// @desc    Delete a product
router.delete('/:id', deleteProduct);

module.exports = router;