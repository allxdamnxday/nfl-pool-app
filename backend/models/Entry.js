// models/Entry.js
const mongoose = require('mongoose');

const EntrySchema = new mongoose.Schema({
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
    default: false
  },
  eliminatedWeek: {
    type: Number,
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for picks
EntrySchema.virtual('picks', {
  ref: 'Pick',
  localField: '_id',
  foreignField: 'entry',
  justOne: false
});

module.exports = mongoose.model('Entry', EntrySchema);