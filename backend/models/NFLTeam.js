const mongoose = require('mongoose');

const ConferenceSchema = new mongoose.Schema({
  conference_id: { type: Number },
  sport_id: { type: Number },
  name: { type: String }
}, { _id: false });

const DivisionSchema = new mongoose.Schema({
  division_id: { type: Number },
  conference_id: { type: Number },
  sport_id: { type: Number },
  name: { type: String }
}, { _id: false });

const NFLTeamSchema = new mongoose.Schema({
  team_id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  mascot: { type: String },
  abbreviation: { type: String, required: true },
  record: { type: String },
  conference: ConferenceSchema,
  division: DivisionSchema
}, { strict: false });  // Allow additional fields not specified in the schema

NFLTeamSchema.index({ team_id: 1, abbreviation: 1 });

module.exports = mongoose.model('NFLTeam', NFLTeamSchema);