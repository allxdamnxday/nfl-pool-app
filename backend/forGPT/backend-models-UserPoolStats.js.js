// backend/models/UserPoolStats.js
const mongoose = require('mongoose');

const UserPoolStatsSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  pool: { type: mongoose.Schema.Types.ObjectId, ref: 'Pool', required: true },
  status: { type: String, enum: ['active', 'eliminated'], default: 'active' },
  eliminationWeek: { type: Number },
  lastPickedWeek: { type: Number, default: 0 },
  pickedTeams: [{ type: mongoose.Schema.Types.ObjectId, ref: 'NFLTeam' }]
}, { timestamps: true });

UserPoolStatsSchema.index({ user: 1, pool: 1 });

module.exports = mongoose.model('UserPoolStats', UserPoolStatsSchema);