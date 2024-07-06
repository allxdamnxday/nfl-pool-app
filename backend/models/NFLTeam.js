const mongoose = require('mongoose');

const NFLTeamSchema = new mongoose.Schema({
  team_id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  mascot: { type: String, required: true },
  abbreviation: { type: String, required: true, unique: true },
  record: { type: String },
  conference: {
    conference_id: Number,
    name: String
  },
  division: {
    division_id: Number,
    name: String
  }
}, { timestamps: true });

NFLTeamSchema.index({ team_id: 1, abbreviation: 1 });

module.exports = mongoose.model('NFLTeam', NFLTeamSchema);