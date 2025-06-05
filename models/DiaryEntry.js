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

// Compound indexes pentru performance optimizat
diaryEntrySchema.index({ user: 1, date: -1 }); // Primary query pattern
diaryEntrySchema.index({ user: 1, createdAt: -1 }); // Pentru timeline
diaryEntrySchema.index({ date: 1 }); // Pentru statistici globale
diaryEntrySchema.index({ product: 1 }); // Pentru product analytics

// Virtual pentru total calorii calculat
diaryEntrySchema.virtual('totalCalories').get(function() {
  if (this.product && this.product.calories && this.quantity) {
    return Math.round((this.product.calories * this.quantity) / 100);
  }
  return this.calories || 0;
});

// Method pentru validarea datelor
diaryEntrySchema.methods.validateEntry = function() {
  if (!this.quantity || this.quantity <= 0) {
    throw new Error('Quantity must be greater than 0');
  }
  if (!this.date || this.date > new Date()) {
    throw new Error('Date cannot be in the future');
  }
  return true;
};

// Static method pentru obținerea statisticilor zilnice
diaryEntrySchema.statics.getDailyStats = function(userId, date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  return this.aggregate([
    {
      $match: {
        user: userId,
        date: { $gte: startOfDay, $lte: endOfDay }
      }
    },
    {
      $lookup: {
        from: 'products',
        localField: 'product',
        foreignField: '_id',
        as: 'productInfo'
      }
    },
    {
      $unwind: '$productInfo'
    },
    {
      $group: {
        _id: null,
        totalCalories: {
          $sum: {
            $multiply: ['$quantity', { $divide: ['$productInfo.calories', 100] }]
          }
        },
        totalEntries: { $sum: 1 },
        entries: { $push: '$$ROOT' }
      }
    }
  ]);
};

// Index for faster queries
diaryEntrySchema.index({ user: 1, date: 1 });

module.exports = mongoose.model('DiaryEntry', diaryEntrySchema);