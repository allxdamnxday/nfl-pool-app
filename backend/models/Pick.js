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
 * @property {boolean|null} isWin - Boolean indicating if the pick was a win (null for pending)
 * @property {mongoose.Schema.Types.ObjectId} game - Reference to the Game model
 * @property {Date} pickMadeAt - Timestamp when the pick was made
 */

/**
 * @class Pick
 * @extends mongoose.Model
 * @description Mongoose model for Pick documents.
 */
const PickSchema = new mongoose.Schema({
  entryNumber: {
    type: Number,
    required: true,
    min: 1,
    max: 3
  },
  entry: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Entry',
    required: true
  },
  week: {
    type: Number,
    required: true,
    min: 1,
    max: 18
  },
  game: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Game',
    required: true
  },
  team: {
    type: String,
    required: true
  },
  result: {
    type: String,
    enum: ['win', 'loss', 'pending'],
    default: 'pending'
  },
  isWin: {
    type: Boolean,
    default: null
  },
  pickMadeAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for ensuring uniqueness of entry, entryNumber, and week combination
PickSchema.index({ entry: 1, entryNumber: 1, week: 1 }, { unique: true });

// Additional indexes for performance optimization
PickSchema.index({ game: 1 });
PickSchema.index({ entry: 1, week: 1 });
PickSchema.index({ isWin: 1 });

// Helper methods
PickSchema.statics.getWinningPicks = function(entryId) {
  return this.find({ entry: entryId, isWin: true });
};

PickSchema.statics.getLosingPicks = function(entryId) {
  return this.find({ entry: entryId, isWin: false });
};

PickSchema.statics.getPendingPicks = function(entryId) {
  return this.find({ entry: entryId, isWin: null });
};

// New method to get the selected team's full name
PickSchema.methods.getSelectedTeamFullName = async function() {
  await this.populate({
    path: 'game',
    select: 'teams_normalized'
  }).execPopulate();
  
  const selectedTeam = this.game.teams_normalized.find(team => 
    team.name === this.team || team.mascot === this.team || `${team.name} ${team.mascot}` === this.team
  );
  
  return selectedTeam ? `${selectedTeam.name} ${selectedTeam.mascot}` : this.team;
};

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
 *   team: 'Patriots',
 *   pickMadeAt: new Date() // This is optional as it defaults to current time
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
 *   { result: 'win', isWin: true },
 *   { new: true },
 *   (err, updatedPick) => {
 *     if (err) {
 *       console.error('Error updating pick:', err);
 *     } else {
 *       console.log('Pick updated successfully:', updatedPick);
 *     }
 * });
 * 
 * // Using helper methods
 * Pick.getWinningPicks('60d5ecb74d6bb830b8e70bfe').then(winningPicks => {
 *   console.log('Winning picks:', winningPicks);
 * });
 */

/**
 * Relationships:
 * - Pick has a many-to-one relationship with Entry (via 'entry' field)
 * - Pick has a many-to-one relationship with Game (via 'game' field)
 * 
 * Validation Rules:
 * - entry field is required and must be a valid Entry ObjectId
 * - entryNumber is required and must be between 1 and 3
 * - week is required and must be between 1 and 18
 * - team is required and should be a valid NFL team name
 * - result must be one of: 'win', 'loss', or 'pending'
 * - isWin is a boolean or null, representing the win status of the pick
 * - game field is required and must be a valid Game ObjectId
 * - pickMadeAt is automatically set to the current time when the pick is created
 * 
 * Additional Notes:
 * - The model uses timestamps to automatically add and update createdAt and updatedAt fields
 * - A compound index ensures that each entry can have only one pick per week for each entry number
 * - The result field defaults to 'pending' and should be updated after the game is completed
 * - The isWin field provides a quick way to determine if a pick was successful
 * - The combination of entry, entryNumber, and week must be unique to prevent duplicate picks
 * - Care should be taken to ensure that picks are made before the start of each game
 * - The model does not include game details directly; it assumes integration with a separate game/schedule system
 * - The pickMadeAt field can be used to enforce pick deadlines and for auditing purposes
 * - When updating a pick, make sure to update both result and isWin fields for consistency
 * - Helper methods (getWinningPicks, getLosingPicks, getPendingPicks) provide easy ways to query picks based on their status
 */