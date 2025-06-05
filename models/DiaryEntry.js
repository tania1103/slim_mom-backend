const mongoose = require('mongoose');

const diaryEntrySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  grams: {
    type: Number,
    required: true,
    min: 1
  },
  calories: {
    type: Number,
    required: true,
    min: 0
  }
}, { timestamps: true });

// Index for faster queries
diaryEntrySchema.index({ user: 1, date: 1 });

module.exports = mongoose.model('DiaryEntry', diaryEntrySchema);