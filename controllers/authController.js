const User = require('../models/User');
const Session = require('../models/Session');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../services/emailService');
const crypto = require('crypto');

// Utility pentru generarea JWT
const generateTokens = (userId) => {
  const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ userId }, process.env.REFRESH_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
};

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Verifică dacă utilizatorul există deja
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      if (existingUser.isEmailVerified) {
        return res.status(409).json({ message: 'Email already registered and verified' });
      } else {
        // Resend verification email
        const verificationToken = crypto.randomBytes(32).toString('hex');
        existingUser.emailVerificationToken = verificationToken;
        existingUser.emailVerificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 ore
        await existingUser.save();
        
        await sendVerificationEmail(email, verificationToken, name);
        return res.status(200).json({ 
          message: 'Verification email resent. Please check your inbox.',
          requiresVerification: true 
        });
      }
    }

    // Creează token pentru verificare
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Creează utilizatorul nou (FĂRĂ să fie verificat)
    const user = new User({
      name,
      email,
      password, // Va fi hash-uit automat de middleware
      emailVerificationToken: verificationToken,
      emailVerificationTokenExpires: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 ore
    });

    await user.save();

    // Trimite email de verificare
    await sendVerificationEmail(email, verificationToken, name);

    res.status(201).json({
      message: 'Account created! Please check your email to verify your account.',
      requiresVerification: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isEmailVerified: user.isEmailVerified
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
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

    // Verifică dacă email-ul este verificat
    if (!user.isEmailVerified) {
      return res.status(401).json({ 
        message: 'Please verify your email before logging in',
        requiresVerification: true,
        email: user.email 
      });
    }

    const isMatch = await user.comparePassword(password);
    console.log('Password match:', isMatch);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });
    
    const { accessToken, refreshToken } = generateTokens(user._id);
    await Session.create({ user: user._id, refreshToken });
    
    res.json({ 
      accessToken, 
      refreshToken, 
      user: { id: user._id, name: user.name, email: user.email, isEmailVerified: user.isEmailVerified } 
    });
  } catch (err) {
    console.log('Login error:', err);
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
};

// VERIFY EMAIL
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ message: 'Verification token is required' });
    }

    // Găsește utilizatorul cu token-ul valid și nu expirat
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationTokenExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ 
        message: 'Invalid or expired verification token',
        expired: true 
      });
    }

    // Marchează email-ul ca verificat
    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationTokenExpires = null;
    await user.save();

    // Generează tokens pentru autentificare automată
    const { accessToken, refreshToken } = generateTokens(user._id);

    // Salvează refresh token în DB
    await Session.create({
      user: user._id,
      refreshToken
    });

    res.status(200).json({
      message: 'Email verified successfully! You are now logged in.',
      verified: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isEmailVerified: user.isEmailVerified
      },
      accessToken,
      refreshToken
    });

  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ message: 'Server error during email verification' });
  }
};

// RESEND VERIFICATION EMAIL
exports.resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ message: 'Email is already verified' });
    }

    // Generează token nou
    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.emailVerificationToken = verificationToken;
    user.emailVerificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save();

    // Trimite email
    await sendVerificationEmail(email, verificationToken, user.name);

    res.status(200).json({ 
      message: 'Verification email sent! Please check your inbox.' 
    });

  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ message: 'Server error sending verification email' });
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