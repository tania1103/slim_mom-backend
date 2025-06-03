const Product = require('../models/Product');

// Create a new product
exports.createProduct = async (req, res) => {
    try {
        const product = new Product(req.body);
        await product.save();
        res.status(201).json(product);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get all products
exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.find();
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get a product by ID
exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update a product by ID
exports.updateProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json(product);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete a product by ID
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Calculează aportul caloric și returnează lista de produse nerecomandate
exports.getDailyInfoPublic = async (req, res) => {
  try {
    const { age, height, weight, desiredWeight, bloodType } = req.body;
    // Exemplu simplificat de calcul calorii
    const dailyCalories = 10 * weight + 6.25 * height - 5 * age + 5;
    const notAllowedProducts = await Product.find({ groupBloodNotAllowed: bloodType }).select('title');
    res.json({ dailyCalories, notAllowedProducts });
  } catch (err) {
    res.status(500).json({ message: 'Failed to calculate daily info', error: err.message });
  }
};

// Endpoint privat: salvează și returnează datele
exports.getDailyInfoPrivate = async (req, res) => {
  try {
    const { age, height, weight, desiredWeight, bloodType } = req.body;
    const dailyCalories = 10 * weight + 6.25 * height - 5 * age + 5;
    const notAllowedProducts = await Product.find({ groupBloodNotAllowed: bloodType }).select('title');
    // Salvează datele la user
    await require('../models/User').findByIdAndUpdate(req.user.userId, {
      age, height, weight, desiredWeight, bloodType, dailyCalories, notAllowedProducts
    });
    res.json({ dailyCalories, notAllowedProducts });
  } catch (err) {
    res.status(500).json({ message: 'Failed to save daily info', error: err.message });
  }
};

// Căutare produse după query
exports.searchProducts = async (req, res) => {
  try {
    const { query } = req.query;
    const products = await Product.find({ title: { $regex: query, $options: 'i' } });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Product search failed', error: err.message });
  }
};