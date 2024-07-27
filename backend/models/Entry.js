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
  },
  picks: [{
    week: {
      type: Number,
      required: true
    },
    team: {
      type: String,
      required: true
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

module.exports = mongoose.model('Entry', EntrySchema);