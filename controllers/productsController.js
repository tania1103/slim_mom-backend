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

// Search products by name
exports.searchProducts = async (req, res) => {
  try {
    // Accept both 'q' and 'search' parameters for flexibility
    const { q, search } = req.query;
    const searchQuery = q || search;
    
    if (!searchQuery) {
      return res.status(400).json({ message: 'Search query is required (use ?q=searchterm)' });
    }

    const products = await Product.find({
      $or: [
        { 'title.ua': { $regex: searchQuery, $options: 'i' } },
        { 'title.en': { $regex: searchQuery, $options: 'i' } },
        { 'title.ru': { $regex: searchQuery, $options: 'i' } }
      ]
    }).limit(20);

    res.status(200).json(products);
  } catch (error) {
    console.error('Search products error:', error);
    res.status(500).json({ message: 'Error searching products', error: error.message });
  }
};

// Get products by blood type
exports.getProductsByBloodType = async (req, res) => {
  try {
    const { bloodType } = req.params;
    
    // Simulate forbidden products for blood type (this would normally come from a database)
    const forbiddenProducts = {
      1: ['sugar', 'chocolate', 'cake'],
      2: ['meat', 'dairy', 'wheat'],
      3: ['chicken', 'corn', 'buckwheat'],
      4: ['red meat', 'seeds', 'nuts']
    };

    const forbidden = forbiddenProducts[bloodType] || [];
    
    res.status(200).json({
      bloodType: parseInt(bloodType),
      notAllowedProducts: forbidden
    });
  } catch (error) {
    console.error('Get products by blood type error:', error);
    res.status(500).json({ message: 'Error fetching products by blood type', error: error.message });
  }
};

// Get all products
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().limit(100);
    res.status(200).json(products);
  } catch (error) {
    console.error('Get all products error:', error);
    res.status(500).json({ message: 'Error fetching products', error: error.message });
  }
};

// Get a product by ID
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json(product);
  } catch (error) {
    console.error('Get product by ID error:', error);
    res.status(500).json({ message: 'Error fetching product', error: error.message });
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