const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  calories: { type: Number, required: true },
  weight: { type: Number },
  groupBloodNotAllowed: [{ type: Number }],
});

module.exports = mongoose.model('Product', productSchema);