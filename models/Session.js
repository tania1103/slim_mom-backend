const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  refreshToken: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: '30d' }
});

module.exports = mongoose.model('Session', sessionSchema);