// models/KillRatio.js

const mongoose = require('mongoose');

const KillRatioSchema = new mongoose.Schema({
  pool: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pool',
    required: true
  },
  week: {
    type: Number,
    required: true,
    min: 1,
    max: 18
  },
  teams: [{
    teamName: {
      type: String,
      required: true
    },
    teamFullName: {
      type: String,
      required: true
    },
    picks: {
      type: Number,
      default: 0
    },
    eliminations: {
      type: Number,
      default: 0
    },
    killRatio: {
      type: Number,
      default: 0
    }
  }],
  totalEntries: {
    type: Number,
    required: true
  },
  totalEliminations: {
    type: Number,
    default: 0
  },
  overallKillRatio: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Compound index for pool and week
KillRatioSchema.index({ pool: 1, week: 1 }, { unique: true });

const KillRatio = mongoose.model('KillRatio', KillRatioSchema);

module.exports = KillRatio;