const DiaryEntry = require('../models/DiaryEntry');
const Product = require('../models/Product');

// Adaugă un produs consumat într-o anumită zi
exports.addProductToDiary = async (req, res) => {
  try {
    const { date, productId, weight, calories } = req.body;
    let entry = await DiaryEntry.findOne({ user: req.user.userId, date });
    if (!entry) {
      entry = await DiaryEntry.create({ user: req.user.userId, date, products: [] });
    }
    entry.products.push({ product: productId, weight, calories });
    await entry.save();
    res.json(entry);
  } catch (err) {
    res.status(500).json({ message: 'Failed to add product', error: err.message });
  }
};

// Șterge un produs consumat într-o anumită zi
exports.removeProductFromDiary = async (req, res) => {
  try {
    const { date, productId } = req.body;
    const entry = await DiaryEntry.findOne({ user: req.user.userId, date });
    if (!entry) return res.status(404).json({ message: 'Diary entry not found' });
    entry.products = entry.products.filter(p => p.product.toString() !== productId);
    await entry.save();
    res.json(entry);
  } catch (err) {
    res.status(500).json({ message: 'Failed to remove product', error: err.message });
  }
};

// Primește toate informațiile despre o anumită zi
exports.getDiaryByDate = async (req, res) => {
  try {
    const { date } = req.params;
    const entry = await DiaryEntry.findOne({ user: req.user.userId, date }).populate('products.product');
    res.json(entry || { products: [] });
  } catch (err) {
    res.status(500).json({ message: 'Failed to get diary', error: err.message });
  }
};