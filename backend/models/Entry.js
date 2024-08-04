// models/Entry.js
const mongoose = require('mongoose');

const EntrySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  pool: {
    type: mongoose.Schema.ObjectId,
    ref: 'Pool',
    required: true
  },
  request: {
    type: mongoose.Schema.ObjectId,
    ref: 'Request',
    required: true
  },
  entryNumber: {
    type: Number,
    required: true,
    min: 1,
    max: 3
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

EntrySchema.index({ user: 1, pool: 1, entryNumber: 1 }, { unique: true });

EntrySchema.virtual('picks', {
  ref: 'Pick',
  localField: '_id',
  foreignField: 'entry',
  justOne: false
});

module.exports = mongoose.model('Entry', EntrySchema);