const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  categories: {
    type: [String],
    required: true,
    index: true
  },
  weight: {
    type: Number,
    required: true,
    min: 0,
    default: 100
  },
  title: {
    ua: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200
    },
    en: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200
    }
  },
  calories: {
    type: Number,
    required: true,
    min: 0,
    max: 1000
  },
  groupBloodNotAllowed: {
    type: [Boolean],
    required: true,
    validate: {
      validator: function(arr) {
        return arr.length === 4;
      },
      message: 'groupBloodNotAllowed must have exactly 4 boolean values'
    }
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Text indexes pentru search performance
productSchema.index({
  'title.ua': 'text',
  'title.en': 'text',
  'categories': 'text'
}, {
  weights: {
    'title.ua': 10,
    'title.en': 8,
    'categories': 5
  },
  name: 'product_text_index'
});

// Compound indexes pentru queries frecvente
productSchema.index({ calories: 1, 'groupBloodNotAllowed': 1 });
productSchema.index({ categories: 1, calories: 1 });

// Virtual pentru titlu în funcție de limba preferată
productSchema.virtual('displayTitle').get(function() {
  return this.title.en || this.title.ua;
});

// Method pentru verificarea compatibilității cu grupa sanguină
productSchema.methods.isAllowedForBloodType = function(bloodType) {
  if (bloodType < 1 || bloodType > 4) return true;
  return !this.groupBloodNotAllowed[bloodType - 1];
};

// Static method pentru search optimizat
productSchema.statics.searchProducts = function(query, bloodType = null, limit = 20) {
  const searchQuery = {
    $text: { $search: query }
  };
  
  if (bloodType && bloodType >= 1 && bloodType <= 4) {
    searchQuery[`groupBloodNotAllowed.${bloodType - 1}`] = false;
  }
  
  return this.find(searchQuery)
    .select('title calories categories groupBloodNotAllowed')
    .limit(limit)
    .sort({ score: { $meta: 'textScore' } });
};

module.exports = mongoose.model('Product', productSchema);