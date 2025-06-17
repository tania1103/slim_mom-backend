const DiaryEntry = require('../models/DiaryEntry');
const Product = require('../models/Product');

// Add a product to the diary for a specific date
exports.addProductToDiary = async (req, res) => {
  try {
    const { date, productId, weight, calories } = req.body;
    let entry = await DiaryEntry.findOne({ user: req.user.userId, date });
    if (!entry) {
      entry = await DiaryEntry.create({ user: req.user.userId, date, products: [] });
    }
    entry.products.push({ product: productId, weight, calories });
    await entry.save();
    res.status(201).json({
      message: 'Product added to diary successfully',
      entry
    });
  } catch (error) {
    console.error('Add product to diary error:', error);
    res.status(500).json({ message: 'Failed to add product', error: error.message });
  }
};

// Remove a product from the diary for a specific date
exports.removeProductFromDiary = async (req, res) => {
  try {
    const { date, productId } = req.body;
    const entry = await DiaryEntry.findOne({ user: req.user.userId, date });
    
    if (!entry) {
      return res.status(404).json({ message: 'Diary entry not found' });
    }
    
    entry.products = entry.products.filter(p => p.product.toString() !== productId);
    await entry.save();
    
    res.status(200).json({
      message: 'Product removed from diary successfully',
      entry
    });
  } catch (error) {
    console.error('Remove product from diary error:', error);
    res.status(500).json({ message: 'Failed to remove product', error: error.message });
  }
};

// Get all diary entries for a specific date
exports.getDiaryByDate = async (req, res) => {
  try {
    const { date } = req.params;
    const entry = await DiaryEntry.findOne({ user: req.user.userId, date }).populate('products.product');
    
    res.status(200).json(entry || { 
      date,
      user: req.user.userId,
      products: [] 
    });
  } catch (error) {
    console.error('Get diary by date error:', error);
    res.status(500).json({ message: 'Failed to get diary', error: error.message });
  }
};

// Add a product to the diary with calculated calories
exports.addToDiary = async (req, res) => {
  try {
    const { productId, date, grams } = req.body;
    const userId = req.user.userId;

    // Find the product to get calories per 100g
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Calculate calories for the given amount
    const calories = (product.calories * grams) / 100;

    const diaryEntry = new DiaryEntry({
      user: userId,
      product: productId,
      date,
      grams,
      calories
    });

    await diaryEntry.save();
    await diaryEntry.populate('product', 'title');

    res.status(201).json({
      message: 'Product added to diary successfully',
      entry: diaryEntry
    });
  } catch (error) {
    console.error('Add to diary error:', error);
    res.status(500).json({ message: 'Error adding product to diary', error: error.message });
  }
};

// Get all diary entries for a specific date with total calories
exports.getDiaryEntries = async (req, res) => {
  try {
    const { date } = req.params;
    const userId = req.user.userId;

    const entries = await DiaryEntry.find({
      user: userId,
      date: new Date(date)
    }).populate('product', 'title calories');

    const totalCalories = entries.reduce((sum, entry) => sum + entry.calories, 0);

    res.status(200).json({
      date,
      entries,
      totalCalories
    });
  } catch (error) {
    console.error('Get diary by date error:', error);
    res.status(500).json({ message: 'Error fetching diary entries', error: error.message });
  }
};

// Șterge o înregistrare din jurnal
exports.deleteDiaryEntry = async (req, res) => {
  try {
    const { entryId } = req.params;
    const userId = req.user.userId;

    const entry = await DiaryEntry.findOneAndDelete({
      _id: entryId,
      user: userId
    });

    if (!entry) {
      return res.status(404).json({ message: 'Diary entry not found' });
    }

    res.status(200).json({ message: 'Diary entry deleted successfully' });
  } catch (error) {
    console.error('Delete diary entry error:', error);
    res.status(500).json({ message: 'Error deleting diary entry', error: error.message });
  }
};

// Obține toate înregistrările din jurnal pentru utilizator
exports.getAllDiaryEntries = async (req, res) => {
  try {
    const userId = req.user.userId;

    const entries = await DiaryEntry.find({ user: userId })
      .populate('product', 'title calories')
      .sort({ date: -1 });

    res.status(200).json(entries);
  } catch (error) {
    console.error('Get all diary entries error:', error);
    res.status(500).json({ message: 'Error fetching diary entries', error: error.message });
  }
};