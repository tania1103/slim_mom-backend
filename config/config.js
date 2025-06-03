const config = {
    PORT: process.env.PORT || 5000,
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/health-tracker',
    JWT_SECRET: process.env.JWT_SECRET || 'your_jwt_secret',
    JWT_EXPIRATION: process.env.JWT_EXPIRATION || '1h',
    REFRESH_TOKEN_EXPIRATION: process.env.REFRESH_TOKEN_EXPIRATION || '30d',
    API_URL: process.env.API_URL || 'http://localhost:5000/api',
};

module.exports = config;