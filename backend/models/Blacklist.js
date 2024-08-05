/**
 * @module Blacklist
 */

const mongoose = require('mongoose');

/**
 * Blacklist Schema
 * @typedef {Object} BlacklistSchema
 * @property {string} token - The blacklisted JWT token
 * @property {Date} createdAt - The date when the token was blacklisted
 */
const BlacklistSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 3600 // 1 hour
  }
});

/**
 * Blacklist model
 * @type {mongoose.Model<BlacklistSchema>}
 */
module.exports = mongoose.model('Blacklist', BlacklistSchema);