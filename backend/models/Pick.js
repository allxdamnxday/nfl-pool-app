// models/Pick.js
const mongoose = require('mongoose');

const PickSchema = new mongoose.Schema({
  entry: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Entry',
    required: true
  },
  entryNumber: {
    type: Number,
    required: true,
    min: 1,
    max: 3
  },
  week: {
    type: Number,
    required: true,
    min: 1,
    max: 18
  },
  team: {
    type: String,
    required: true
  },
  result: {
    type: String,
    enum: ['win', 'loss', 'pending'],
    default: 'pending'
  }
}, {
  timestamps: true
});

PickSchema.index({ entry: 1, entryNumber: 1, week: 1 }, { unique: true });

module.exports = mongoose.model('Pick', PickSchema);