// /backend/models/NFLTeam.js
const mongoose = require('mongoose');
mongoose.models = {};
mongoose.modelSchemas = {};

const Schema = mongoose.Schema;

const NFLTeamSchema = new Schema({
  team_id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  mascot: { type: String },
  abbreviation: { type: String, required: true },
  record: { type: String },
  conference: {
    conference_id: { type: Number },
    sport_id: { type: Number },
    name: { type: String }
  },
  division: {
    division_id: { type: Number },
    conference_id: { type: Number },
    sport_id: { type: Number },
    name: { type: String }
  },
  logoUrl: { type: String }
}, { timestamps: true });

NFLTeamSchema.index({ team_id: 1, abbreviation: 1 });

module.exports = mongoose.model('NFLTeam', NFLTeamSchema);