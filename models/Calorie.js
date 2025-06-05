const mongoose = require('mongoose');

const calorieSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  intake: {
    type: Number,
    default: 0
  },
  products: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    name: String,
    weight: Number,
    calories: Number,
    addedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Index pentru queries mai rapide
calorieSchema.index({ userId: 1, date: 1 });

module.exports = mongoose.model('Calorie', calorieSchema);