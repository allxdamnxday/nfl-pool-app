/**
 * @module Pick
 * @description Represents a pick made by a user for a specific entry in an NFL pool. This model handles the 
 * tracking of team selections for each week of the NFL season, including the result of each pick.
 */

const mongoose = require('mongoose');

/**
 * Pick Schema
 * @typedef {Object} PickSchema
 * @property {mongoose.Schema.Types.ObjectId} entry - Reference to the Entry model
 * @property {number} entryNumber - The entry number (1-3)
 * @property {number} week - The week number of the pick (1-18)
 * @property {string} team - The team picked
 * @property {string} result - The result of the pick (win, loss, or pending)
 */

/**
 * @class Pick
 * @extends mongoose.Model
 * @description Mongoose model for Pick documents.
 */
const PickSchema = new mongoose.Schema({
  entry: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Entry',
    required: [true, 'Entry is required for a pick']
  },
  entryNumber: {
    type: Number,
    required: [true, 'Entry number is required'],
    min: [1, 'Entry number must be at least 1'],
    max: [3, 'Entry number cannot exceed 3']
  },
  week: {
    type: Number,
    required: [true, 'Week number is required'],
    min: [1, 'Week number must be at least 1'],
    max: [18, 'Week number cannot exceed 18']
  },
  team: {
    type: String,
    required: [true, 'Team pick is required']
  },
  result: {
    type: String,
    enum: ['win', 'loss', 'pending'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Index for ensuring uniqueness of entry, entryNumber, and week combination
PickSchema.index({ entry: 1, entryNumber: 1, week: 1 }, { unique: true });

/**
 * Pick model
 * @type {mongoose.Model}
 */
const Pick = mongoose.model('Pick', PickSchema);

module.exports = Pick;

/**
 * @example
 * // Creating a new pick
 * const newPick = new Pick({
 *   entry: '60d5ecb74d6bb830b8e70bfe',
 *   entryNumber: 1,
 *   week: 5,
 *   team: 'Patriots'
 * });
 * 
 * // Saving the pick to the database
 * newPick.save((err, pick) => {
 *   if (err) {
 *     console.error('Error saving pick:', err);
 *   } else {
 *     console.log('Pick saved successfully:', pick);
 *   }
 * });
 * 
 * // Updating a pick's result
 * Pick.findOneAndUpdate(
 *   { entry: '60d5ecb74d6bb830b8e70bfe', entryNumber: 1, week: 5 },
 *   { result: 'win' },
 *   { new: true },
 *   (err, updatedPick) => {
 *     if (err) {
 *       console.error('Error updating pick:', err);
 *     } else {
 *       console.log('Pick updated successfully:', updatedPick);
 *     }
 * });
 */

/**
 * Relationships:
 * - Pick has a many-to-one relationship with Entry (via 'entry' field)
 * 
 * Validation Rules:
 * - entry field is required and must be a valid Entry ObjectId
 * - entryNumber is required and must be between 1 and 3
 * - week is required and must be between 1 and 18
 * - team is required and should be a valid NFL team name
 * - result must be one of: 'win', 'loss', or 'pending'
 * 
 * Additional Notes:
 * - The model uses timestamps to automatically add and update createdAt and updatedAt fields
 * - A compound index ensures that each entry can have only one pick per week for each entry number
 * - The result field defaults to 'pending' and should be updated after the game is completed
 * - The combination of entry, entryNumber, and week must be unique to prevent duplicate picks
 * - Care should be taken to ensure that picks are made before the start of each game
 * - The model does not include game details directly; it assumes integration with a separate game/schedule system
 */