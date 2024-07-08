// backend/models/Pick.js
const mongoose = require('mongoose');

const PickSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  pool: { type: mongoose.Schema.Types.ObjectId, ref: 'Pool', required: true },
  weekNumber: { type: Number, required: true },
  team: { type: mongoose.Schema.Types.ObjectId, ref: 'NFLTeam', required: true },
  game: { type: mongoose.Schema.Types.ObjectId, ref: 'Game', required: true },
  market: { type: mongoose.Schema.Types.ObjectId, ref: 'Market', required: true },
  status: { type: String, enum: ['pending', 'win', 'loss'], default: 'pending' },
  lineValue: { type: String },
  odds: { type: Number }
}, { timestamps: true });

PickSchema.index({ user: 1, pool: 1, weekNumber: 1 });

module.exports = mongoose.model('Pick', PickSchema);