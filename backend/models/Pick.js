// models/Pick.js
const mongoose = require('mongoose');

const PickSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  entry: {
    type: mongoose.Schema.ObjectId,
    ref: 'Entry',
    required: true
  },
  game: {
    type: mongoose.Schema.ObjectId,
    ref: 'Game',
    required: true
  },
  week: {
    type: Number,
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
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Pick', PickSchema);