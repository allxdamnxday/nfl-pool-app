// backend/models/Game.js
const mongoose = require('mongoose');

const GameSchema = new mongoose.Schema({
  id: { type: String, required: true },
  event_id: { type: String, required: true, unique: true },
  event_uuid: { type: String, required: true },
  sport_id: { type: Number, required: true },
  season_type: { type: String, required: true },
  season_year: { type: Number, required: true },
  away_team_id: { type: Number, required: true },
  home_team_id: { type: Number, required: true },
  away_team: { type: String, required: true },
  home_team: { type: String, required: true },
  date_event: { type: Date, required: true },
  neutral_site: { type: Boolean, required: true },
  conference_competition: { type: Boolean, required: true },
  away_score: { type: Number },
  home_score: { type: Number },
  league_name: { type: String, required: true },
  event_name: { type: String, required: true },
  event_location: { type: String },
  attendance: { type: Number },
  updated_at: { type: Date, required: true },
  event_status: { type: String },
  event_status_detail: { type: String }
}, { timestamps: true });

GameSchema.index({ event_id: 1 }, { unique: true });

module.exports = mongoose.model('Game', GameSchema);