// backend/models/Player.js
const mongoose = require('mongoose');

const PlayerSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  displayName: { type: String, required: true },
  team: { type: mongoose.Schema.Types.ObjectId, ref: 'NFLTeam' },
  position: { type: String },
  jerseyNumber: { type: Number },
  rundownId: { type: String, required: true, unique: true },
  active: { type: Boolean, default: true },
  status: { type: String }
}, { timestamps: true });

PlayerSchema.index({ lastName: 1, firstName: 1 });
PlayerSchema.index({ rundownId: 1 });

module.exports = mongoose.model('Player', PlayerSchema);