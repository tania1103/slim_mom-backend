const User = require('../models/User');
const Session = require('../models/Session');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const registerUser = async (userData) => {
    const { email, password } = userData;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashedPassword });
    return await newUser.save();
};

const authenticateUser = async (email, password) => {
    const user = await User.findOne({ email });
    if (!user) {
        throw new Error('User not found');
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new Error('Invalid credentials');
    }
    return user;
};

const createSession = async (userId) => {
    const session = new Session({ userId });
    return await session.save();
};

const logoutUser = async (sessionId) => {
    return await Session.findByIdAndDelete(sessionId);
};

const generateTokens = (user) => {
    const accessToken = jwt.sign({ id: user._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ id: user._id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
    return { accessToken, refreshToken };
};

module.exports = {
    registerUser,
    authenticateUser,
    createSession,
    logoutUser,
    generateTokens,
};