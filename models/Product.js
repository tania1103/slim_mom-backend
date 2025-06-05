const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    index: true
  },
  calories: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    default: 'other'
  },
  weight: {
    type: Number,
    default: 100
  }
}, { timestamps: true });

// Index for faster search
productSchema.index({ title: 'text' });

module.exports = mongoose.model('Product', productSchema);