// models/Entry.js
const mongoose = require('mongoose');

const EntrySchema = new mongoose.Schema({
  entryNumber: {
    type: Number,
    required: true
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

EntrySchema.index({ pool: 1, entryNumber: 1 }, { unique: true });

module.exports = mongoose.model('Entry', EntrySchema);