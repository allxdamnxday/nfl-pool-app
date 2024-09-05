/**
 * @module Entry
 * @description Represents an entry in a pool for the NFL pool application. This model handles the relationship
 * between users and pools, tracking the status of each entry throughout the NFL season.
 */

const mongoose = require('mongoose');

/**
 * Entry Schema
 * @typedef {Object} EntrySchema
 * @property {mongoose.Schema.ObjectId} user - The user who owns the entry
 * @property {mongoose.Schema.ObjectId} pool - The pool the entry is for
 * @property {mongoose.Schema.ObjectId} request - The request associated with this entry
 * @property {number} entryNumber - The entry number (1-3)
 * @property {string} status - The status of the entry (active or eliminated)
 * @property {number} [eliminatedWeek] - The week the entry was eliminated (if applicable)
 * @property {Date} createdAt - The date the entry was created
 */

/**
 * @class Entry
 * @extends mongoose.Model
 * @description Mongoose model for Entry documents.
 */
const EntrySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'User is required for an entry']
  },
  pool: {
    type: mongoose.Schema.ObjectId,
    ref: 'Pool',
    required: [true, 'Pool is required for an entry']
  },
  request: {
    type: mongoose.Schema.ObjectId,
    ref: 'Request',
    required: [true, 'Request is required for an entry']
  },
  entryNumber: {
    type: Number,
    required: [true, 'Entry number is required'],
    min: [1, 'Entry number must be at least 1'],
    max: [3, 'Entry number cannot exceed 3']
  },
  status: {
    type: String,
    enum: ['active', 'eliminated'],
    default: 'active'
  },
  eliminatedWeek: {
    type: Number,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add a compound index to ensure uniqueness of user-pool-entryNumber combination
EntrySchema.index({ user: 1, pool: 1, entryNumber: 1 }, { unique: true });

/**
 * Virtual field for entry picks
 * @name picks
 * @memberof module:Entry
 * @inner
 * @type {mongoose.Schema.Types.Virtual}
 */
EntrySchema.virtual('picks', {
  ref: 'Pick',
  localField: '_id',
  foreignField: 'entry',
  justOne: false
});

// Add the canUpdatePick method to the schema
EntrySchema.methods.canUpdatePick = async function(week, team) {
  const { getCurrentNFLWeek } = require('../services/seasonService');
  const Game = mongoose.model('Game');

  const { week: currentWeek, seasonYear } = getCurrentNFLWeek();

  if (week > currentWeek) {
    // Future week: Allow pick, but check if game exists
    const game = await Game.findOne({
      'schedule.week': week,
      'schedule.season_year': seasonYear,
      $or: [{ away_team: team }, { home_team: team }]
    });

    if (!game) {
      return { canUpdate: false, reason: 'No game found for the selected team in this week' };
    }
    return { canUpdate: true, newGame: game };
  } else if (week === currentWeek) {
    // Current week: Check if game has started or is within 5 minutes of starting
    const game = await Game.findOne({
      'schedule.week': week,
      'schedule.season_year': seasonYear,
      $or: [{ away_team: team }, { home_team: team }]
    });

    if (!game) {
      return { canUpdate: false, reason: 'No game found for the selected team in this week' };
    }

    const now = new Date();
    const gameStart = new Date(game.event_date);
    const timeDiff = gameStart.getTime() - now.getTime();
    const minutesDiff = timeDiff / (1000 * 60);

    if (minutesDiff < 5) {
      return { canUpdate: false, reason: 'Game has started or is about to start' };
    }
    return { canUpdate: true, newGame: game };
  } else {
    // Past week: Disallow changes
    return { canUpdate: false, reason: 'Cannot change picks for past weeks' };
  }
};

/**
 * Entry model
 * @type {mongoose.Model}
 */
const Entry = mongoose.model('Entry', EntrySchema);

module.exports = Entry;

/**
 * @example
 * // Creating a new entry
 * const newEntry = new Entry({
 *   user: '60d5ecb74d6bb830b8e70bfb',
 *   pool: '60d5ecb74d6bb830b8e70bfc',
 *   request: '60d5ecb74d6bb830b8e70bfd',
 *   entryNumber: 1
 * });
 * 
 * // Saving the entry to the database
 * newEntry.save((err, entry) => {
 *   if (err) {
 *     console.error('Error saving entry:', err);
 *   } else {
 *     console.log('Entry saved successfully:', entry);
 *   }
 * });
 * 
 * // Updating an entry's status
 * Entry.findByIdAndUpdate('60d5ecb74d6bb830b8e70bfe', 
 *   { status: 'eliminated', eliminatedWeek: 5 }, 
 *   { new: true }, 
 *   (err, updatedEntry) => {
 *     if (err) {
 *       console.error('Error updating entry:', err);
 *     } else {
 *       console.log('Entry updated successfully:', updatedEntry);
 *     }
 * });
 */

/**
 * Relationships:
 * - Entry has a many-to-one relationship with User (via 'user' field)
 * - Entry has a many-to-one relationship with Pool (via 'pool' field)
 * - Entry has a one-to-one relationship with Request (via 'request' field)
 * - Entry has a one-to-many relationship with Pick (via 'picks' virtual)
 * 
 * Validation Rules:
 * - user, pool, and request fields are required and must be valid ObjectIds
 * - entryNumber is required and must be between 1 and 3
 * - status must be either 'active' or 'eliminated'
 * - eliminatedWeek is optional and should be set when status changes to 'eliminated'
 * 
 * Additional Notes:
 * - The model uses timestamps to automatically add and update createdAt and updatedAt fields
 * - A compound index ensures that each user can have only one entry with a specific number in a given pool
 * - The virtual 'picks' field allows easy access to all picks associated with this entry
 * - The status field allows for tracking whether an entry is still active in the pool or has been eliminated
 * - The eliminatedWeek field can be used to track when an entry was eliminated from the pool
 */