const User = require('../models/User');
const Session = require('../models/Session');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(409).json({ message: 'Email already in use' });
    // Nu mai hash-uim parola aici, lăsăm modelul să o facă
    const user = await User.create({ name, email, password });
    res.status(201).json({ message: 'User registered', userId: user._id });
  } catch (err) {
    res.status(500).json({ message: 'Registration failed', error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt:', email, password);
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found');
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const isMatch = await user.comparePassword(password);
    console.log('Password match:', isMatch);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });
    const accessToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const refreshToken = jwt.sign({ userId: user._id }, process.env.REFRESH_SECRET, { expiresIn: '30d' });
    await Session.create({ user: user._id, refreshToken });
    res.json({ accessToken, refreshToken, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    console.log('Login error:', err);
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
};

exports.logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    await Session.findOneAndDelete({ refreshToken });
    res.json({ message: 'Logged out' });
  } catch (err) {
    res.status(500).json({ message: 'Logout failed', error: err.message });
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ message: 'No refresh token' });
    const session = await Session.findOne({ refreshToken });
    if (!session) return res.status(403).json({ message: 'Invalid refresh token' });
    jwt.verify(refreshToken, process.env.REFRESH_SECRET, (err, decoded) => {
      if (err) return res.status(403).json({ message: 'Invalid refresh token' });
      const accessToken = jwt.sign({ userId: decoded.userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.json({ accessToken });
    });
  } catch (err) {
    res.status(500).json({ message: 'Token refresh failed', error: err.message });
  }
};