// models/Pool.js
const mongoose = require('mongoose');

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
    min: [1, 'Week number must be at least 1'],
    max: [18, 'Week number cannot exceed 18']
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
    required: [true, 'Please add a prize amount'],
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
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Reverse populate with virtuals
PoolSchema.virtual('picks', {
  ref: 'Pick',
  localField: '_id',
  foreignField: 'pool',
  justOne: false
});

module.exports = mongoose.model('Pool', PoolSchema);