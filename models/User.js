const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50,
    match: [/^[a-zA-ZăâîșțĂÂÎȘȚ\s-']+$/, 'Name can only contain letters, spaces, hyphens and apostrophes']
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  // Profile fields
  age: { type: Number, min: 13, max: 120 },
  height: { type: Number, min: 100, max: 250 },
  currentWeight: { type: Number, min: 30, max: 300 },
  desiredWeight: { type: Number, min: 30, max: 300 },
  bloodType: { type: Number, enum: [1, 2, 3, 4], default: 1 },
  gender: { type: String, enum: ['male', 'female'], default: 'female' },
  activityLevel: { type: String, enum: ['sedentary', 'light', 'moderate', 'active', 'very_active'], default: 'sedentary' },
  
  // Calculated fields
  dailyCalories: { type: Number },
  notAllowedProducts: [{ type: String }],
  
  // Email verification fields
  isEmailVerified: { type: Boolean, default: false },
  emailVerificationToken: { type: String, default: null },
  emailVerificationTokenExpires: { type: Date, default: null },
  
  // Password reset fields
  resetPasswordToken: String,
  resetPasswordExpires: Date
}, { timestamps: true });

// Create indexes for better performance and security
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ emailVerificationToken: 1 }, { sparse: true });
userSchema.index({ resetPasswordToken: 1 }, { sparse: true });
userSchema.index({ createdAt: 1 });
userSchema.index({ isEmailVerified: 1 });

// Compound index for active sessions
userSchema.index({ _id: 1, isEmailVerified: 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    this.password = await bcrypt.hash(this.password, 12);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Calculate daily calories based on Harris-Benedict formula
userSchema.methods.calculateDailyCalories = function() {
  if (!this.age || !this.height || !this.currentWeight) {
    return null;
  }
  
  // Harris-Benedict equation
  let bmr;
  if (this.gender === 'male') {
    bmr = 88.362 + (13.397 * this.currentWeight) + (4.799 * this.height) - (5.677 * this.age);
  } else {
    bmr = 447.593 + (9.247 * this.currentWeight) + (3.098 * this.height) - (4.330 * this.age);
  }
  
  // Activity factor
  const activityFactors = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9
  };
  
  const factor = activityFactors[this.activityLevel] || 1.2;
  return Math.round(bmr * factor);
};

// Get forbidden products by blood type
userSchema.methods.getForbiddenProducts = function() {
  // Implementation based on blood type restrictions
  const restrictions = {
    1: ['pork', 'wheat', 'corn', 'kidney beans'],
    2: ['meat', 'dairy', 'kidney beans', 'lima beans'],
    3: ['chicken', 'corn', 'buckwheat', 'lentils'],
    4: ['red meat', 'kidney beans', 'corn', 'buckwheat']
  };
  
  return restrictions[this.bloodType] || [];
};

// Remove sensitive data when converting to JSON
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.emailVerificationToken;
  delete user.resetPasswordToken;
  delete user.emailVerificationTokenExpires;
  delete user.resetPasswordExpires;
  return user;
};

module.exports = mongoose.model('User', userSchema);