// models/Entry.js
const mongoose = require('mongoose');

const EntrySchema = new mongoose.Schema({
  entryNumber: {
    type: Number,
    required: true,
    min: 1,
    max: 3
  },
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
  isActive: {
    type: Boolean,
    default: true
  },
  eliminatedWeek: {
    type: Number,
    default: null
  },
  totalPoints: {
    type: Number,
    default: 0
  },
  rank: {
    type: Number
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

EntrySchema.index({ user: 1, pool: 1, entryNumber: 1 }, { unique: true });

EntrySchema.virtual('picks', {
  ref: 'Pick',
  localField: '_id',
  foreignField: 'entry',
  justOne: false
});

module.exports = mongoose.model('Entry', EntrySchema);