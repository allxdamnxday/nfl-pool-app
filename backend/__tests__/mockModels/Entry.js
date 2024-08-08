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
  request: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Request'
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
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

EntrySchema.virtual('picks', {
  ref: 'Pick',
  localField: '_id',
  foreignField: 'entry',
  justOne: false
});

module.exports = mongoose.model('Entry', EntrySchema);