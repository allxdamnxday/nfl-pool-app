/**
 * @module UserPoolStats
 */

const mongoose = require('mongoose');

/**
 * Entry Stats Schema
 * @typedef {Object} EntryStatsSchema
 * @property {number} entryNumber - The entry number (1, 2, or 3)
 * @property {string} status - The status of the entry (active or eliminated)
 * @property {number} [eliminationWeek] - The week number when the entry was eliminated (if applicable)
 * @property {number} lastPickedWeek - The last week number for which a pick was made for this entry
 * @property {mongoose.Schema.Types.ObjectId[]} pickedTeams - Array of references to the NFLTeam model representing picked teams for this entry
 */
const EntryStatsSchema = new mongoose.Schema({
  entryNumber: {
    type: Number,
    required: true,
    enum: [1, 2, 3]
  },
  status: {
    type: String,
    enum: ['active', 'eliminated'],
    default: 'active'
  },
  eliminationWeek: {
    type: Number
  },
  lastPickedWeek: {
    type: Number,
    default: 0
  },
  pickedTeams: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NFLTeam'
  }]
});

/**
 * UserPoolStats Schema
 * @typedef {Object} UserPoolStatsSchema
 * @property {mongoose.Schema.Types.ObjectId} user - Reference to the User model
 * @property {mongoose.Schema.Types.ObjectId} pool - Reference to the Pool model
 * @property {number} totalEntries - Total number of entries for this user in this pool (1-3)
 * @property {EntryStatsSchema[]} entries - Array of entry stats for each entry
 * @property {number} activeEntries - Number of active entries for this user in this pool
 * @property {number} eliminatedEntries - Number of eliminated entries for this user in this pool
 * @property {Date} lastActivityDate - Date of the last activity for this user in this pool
 */
const UserPoolStatsSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  pool: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Pool', 
    required: true 
  },
  totalEntries: {
    type: Number,
    required: true,
    min: 1,
    max: 3
  },
  entries: [EntryStatsSchema],
  activeEntries: {
    type: Number,
    default: 0
  },
  eliminatedEntries: {
    type: Number,
    default: 0
  },
  lastActivityDate: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Index for efficient querying of user-pool combinations
UserPoolStatsSchema.index({ user: 1, pool: 1 }, { unique: true });

/**
 * UserPoolStats model
 * @type {mongoose.Model<UserPoolStatsSchema>}
 */
module.exports = mongoose.model('UserPoolStats', UserPoolStatsSchema);