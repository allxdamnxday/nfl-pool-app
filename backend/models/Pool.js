/**
 * @module Pool
 * @description Represents a pool in the NFL pool application. This model handles the creation and management of pools,
 * including participant tracking, entry fees, prize amounts, and pool status throughout the NFL season.
 */

const mongoose = require('mongoose');

/**
 * Pool Schema
 * @typedef {Object} PoolSchema
 * @property {string} name - The name of the pool
 * @property {number} season - The season year of the pool
 * @property {number} currentWeek - The current week of the pool
 * @property {string} status - The status of the pool (pending, active, completed, open)
 * @property {number} maxParticipants - The maximum number of participants allowed
 * @property {number} entryFee - The entry fee for the pool
 * @property {number} prizeAmount - The prize amount for the pool
 * @property {mongoose.Schema.Types.ObjectId} creator - The user who created the pool
 * @property {mongoose.Schema.Types.ObjectId[]} participants - The users participating in the pool
 * @property {mongoose.Schema.Types.ObjectId[]} eliminatedUsers - The users eliminated from the pool
 * @property {string} description - The description of the pool
 * @property {Date} startDate - The start date of the pool
 * @property {Date} endDate - The end date of the pool
 * @property {number} maxEntries - The maximum number of entries allowed per user
 * @property {number} prizePot - The total prize pot for the pool
 * @property {number} numberOfWeeks - The number of weeks for the pool
 */

/**
 * @class Pool
 * @extends mongoose.Model
 * @description Mongoose model for Pool documents.
 */
const PoolSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a pool name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  season: {
    type: Number,
    required: [true, 'Please add a season year'],
    min: [2020, 'Season year must be 2020 or later']
  },
  currentWeek: {
    type: Number,
    default: 1,
    min: [1, 'Current week must be at least 1'],
    max: [18, 'Current week cannot exceed 18']
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'completed', 'open'],
    default: 'pending'
  },
  maxParticipants: {
    type: Number,
    required: [true, 'Please add a maximum number of participants'],
    min: [2, 'Pool must have at least 2 participants'],
    max: [10000, 'Pool cannot exceed 10000 participants']
  },
  entryFee: {
    type: Number,
    required: [true, 'Please add an entry fee'],
    min: [0, 'Entry fee cannot be negative']
  },
  prizeAmount: {
    type: Number,
    min: [0, 'Prize amount cannot be negative']
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  eliminatedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  description: {
    type: String,
    required: [true, 'Please add a pool description'],
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  startDate: {
    type: Date,
    required: [true, 'Please add a start date']
  },
  endDate: {
    type: Date,
    required: [true, 'Please add an end date']
  },
  maxEntries: {
    type: Number,
    required: [true, 'Please add a maximum number of entries'],
    min: [1, 'Pool must allow at least 1 entry'],
    max: [30000, 'Pool cannot exceed 30000 entries']
  },
  prizePot: {
    type: Number,
    min: [0, 'Prize pot cannot be negative']
  },
  numberOfWeeks: {
    type: Number,
    required: [true, 'Please add the number of weeks for the pool'],
    min: [1, 'Number of weeks must be at least 1'],
    max: [18, 'Number of weeks cannot exceed 18']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

/**
 * Virtual field for pool picks
 * @name picks
 * @memberof module:Pool
 * @inner
 * @type {mongoose.Schema.Types.Virtual}
 */
PoolSchema.virtual('picks', {
  ref: 'Pick',
  localField: '_id',
  foreignField: 'pool',
  justOne: false
});

/**
 * Virtual field for pool entries
 * @name entries
 * @memberof module:Pool
 * @inner
 * @type {mongoose.Schema.Types.Virtual}
 */
PoolSchema.virtual('entries', {
  ref: 'Entry',
  localField: '_id',
  foreignField: 'pool',
  justOne: false
});

/**
 * Virtual field for pool requests
 * @name requests
 * @memberof module:Pool
 * @inner
 * @type {mongoose.Schema.Types.Virtual}
 */
PoolSchema.virtual('requests', {
  ref: 'Request',
  localField: '_id',
  foreignField: 'pool',
  justOne: false
});

/**
 * Pool model
 * @type {mongoose.Model}
 */
const Pool = mongoose.model('Pool', PoolSchema);

module.exports = Pool;

/**
 * @example
 * // Creating a new pool
 * const newPool = new Pool({
 *   name: 'NFL 2023 Survivor Pool',
 *   season: 2023,
 *   maxParticipants: 100,
 *   entryFee: 50,
 *   prizeAmount: 4500,
 *   creator: '60d5ecb74d6bb830b8e70bfb',
 *   description: 'Join our exciting NFL 2023 Survivor Pool!',
 *   startDate: new Date('2023-09-07'),
 *   endDate: new Date('2024-01-07'),
 *   maxEntries: 3,
 *   prizePot: 5000,
 *   numberOfWeeks: 17
 * });
 * 
 * // Saving the pool to the database
 * newPool.save((err, pool) => {
 *   if (err) {
 *     console.error('Error saving pool:', err);
 *   } else {
 *     console.log('Pool saved successfully:', pool);
 *   }
 * });
 * 
 * // Updating a pool's status
 * Pool.findByIdAndUpdate('60d5ecb74d6bb830b8e70bfc', { status: 'active' }, { new: true }, (err, updatedPool) => {
 *   if (err) {
 *     console.error('Error updating pool:', err);
 *   } else {
 *     console.log('Pool updated successfully:', updatedPool);
 *   }
 * });
 */

/**
 * Relationships:
 * - Pool has a many-to-one relationship with User (via 'creator' field)
 * - Pool has a many-to-many relationship with User (via 'participants' and 'eliminatedUsers' fields)
 * - Pool has a one-to-many relationship with Pick (via 'picks' virtual)
 * - Pool has a one-to-many relationship with Entry (via 'entries' virtual)
 * - Pool has a one-to-many relationship with Request (via 'requests' virtual)
 * 
 * Validation Rules:
 * - name is required, trimmed, and has a maximum length of 50 characters
 * - season is required and must be 2020 or later
 * - currentWeek must be between 1 and 18
 * - status must be one of: 'pending', 'active', 'completed', or 'open'
 * - maxParticipants is required and must be between 2 and 10000
 * - entryFee and prizeAmount are required and must be non-negative
 * - creator is required and must be a valid User ObjectId
 * - description is required and has a maximum length of 500 characters
 * - startDate and endDate are required
 * - maxEntries is required and must be between 2 and 30000
 * - prizePot is required and must be non-negative
 * - numberOfWeeks is required and must be between 1 and 18
 * 
 * Additional Notes:
 * - The model uses timestamps to automatically add and update createdAt and updatedAt fields
 * - Virtual fields are used to establish relationships with Pick, Entry, and Request models
 * - The toJSON and toObject options are set to include virtuals when the document is converted to JSON or a plain object
 * - The currentWeek field can be used to track the progress of the pool throughout the NFL season
 * - The status field allows for tracking the lifecycle of a pool from creation to completion
 */