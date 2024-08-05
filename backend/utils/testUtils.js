/**
 * @module testUtils
 */

const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongod;

/**
 * Connects to an in-memory MongoDB database for testing purposes.
 * @async
 * @function connectToDatabase
 * @returns {Promise<void>}
 * @throws {Error} If connection fails
 */
async function connectToDatabase() {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 30000, // Increase timeout to 30 seconds
  });
}


/**
 * Generates an admin JWT token for testing purposes.
 * @function generateAdminToken
 * @param {Object} user - The user object
 * @param {string} user._id - The user's ID
 * @returns {string} The generated JWT token
 */
exports.generateAdminToken = (user) => {
  return jwt.sign({ id: user._id, role: 'admin' }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};