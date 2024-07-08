// This runs once after all tests
const mongoose = require('mongoose');

module.exports = async () => {
  // Clean up any global services or configurations
  await mongoose.connection.close();
};