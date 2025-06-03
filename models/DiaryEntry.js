const mongoose = require('mongoose');

const diaryEntrySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true }, // format YYYY-MM-DD
  products: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      weight: Number,
      calories: Number
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('DiaryEntry', diaryEntrySchema);