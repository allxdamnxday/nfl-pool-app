require('dotenv').config({ path: '.env.test' }); // Load environment variables from .env.test

const { connectDB } = require('./server');

module.exports = async () => {
  // Set up any global configuration or services needed for tests
  process.env.NODE_ENV = 'test';
  await connectDB();
};