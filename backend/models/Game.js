// backend/models/Game.js
const mongoose = require('mongoose');

const GameSchema = new mongoose.Schema({
  event_id: { type: String, required: true, unique: true },
  event_uuid: { type: String, required: true },
  sport_id: { type: Number, required: true },
  event_date: { type: Date, required: true },
  rotation_number_away: { type: Number },
  rotation_number_home: { type: Number },
  away_team_id: { type: Number, required: true },
  home_team_id: { type: Number, required: true },
  away_team: { type: String, required: true },
  home_team: { type: String, required: true },
  total: { type: Number },
  score: {
    event_status: String,
    winner_away: Number,
    winner_home: Number,
    score_away: Number,
    score_home: Number,
    score_away_by_period: [Number],
    score_home_by_period: [Number],
    venue_name: String,
    venue_location: String,
    game_clock: Number,
    display_clock: String,
    game_period: Number,
    broadcast: String,
    event_status_detail: String,
    updated_at: Date
  },
  teams_normalized: [{
    team_id: Number,
    name: String,
    mascot: String,
    abbreviation: String,
    conference_id: Number,
    division_id: Number,
    ranking: Number,
    record: String,
    is_away: Boolean,
    is_home: Boolean
  }],
  schedule: {
    league_name: String,
    conference_competition: Boolean,
    season_type: String,
    season_year: Number,
    week: Number, // Added week field
    week_name: String,
    week_detail: String,
    event_name: String,
    attendance: String
  }
}, { timestamps: true });

GameSchema.index({ event_id: 1 }, { unique: true });
GameSchema.index({ event_date: 1 });

module.exports = mongoose.model('Game', GameSchema);