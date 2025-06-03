const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const generateHash = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
};

const compareHash = async (password, hash) => {
    return await bcrypt.compare(password, hash);
};

const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

const verifyToken = (token) => {
    return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = {
    generateHash,
    compareHash,
    generateToken,
    verifyToken,
};