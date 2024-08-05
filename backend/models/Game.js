/**
 * @module Game
 */

const mongoose = require('mongoose');

/**
 * Game Schema
 * @typedef {Object} GameSchema
 * @property {string} event_id - Unique identifier for the event
 * @property {string} event_uuid - UUID for the event
 * @property {number} sport_id - ID of the sport
 * @property {Date} event_date - Date and time of the event
 * @property {number} [rotation_number_away] - Rotation number for the away team
 * @property {number} [rotation_number_home] - Rotation number for the home team
 * @property {number} away_team_id - ID of the away team
 * @property {number} home_team_id - ID of the home team
 * @property {string} away_team - Name of the away team
 * @property {string} home_team - Name of the home team
 * @property {number} [total] - Total score for the game
 * @property {Object} score - Detailed score information
 * @property {string} score.event_status - Current status of the event
 * @property {number} score.winner_away - Away team winner indicator
 * @property {number} score.winner_home - Home team winner indicator
 * @property {number} score.score_away - Away team score
 * @property {number} score.score_home - Home team score
 * @property {number[]} score.score_away_by_period - Away team scores by period
 * @property {number[]} score.score_home_by_period - Home team scores by period
 * @property {string} score.venue_name - Name of the venue
 * @property {string} score.venue_location - Location of the venue
 * @property {number} score.game_clock - Current game clock
 * @property {string} score.display_clock - Display format of the game clock
 * @property {number} score.game_period - Current game period
 * @property {string} score.broadcast - Broadcast information
 * @property {string} score.event_status_detail - Detailed event status
 * @property {Date} score.updated_at - Last update time of the score
 * @property {Object[]} teams_normalized - Normalized team information
 * @property {number} teams_normalized.team_id - ID of the team
 * @property {string} teams_normalized.name - Name of the team
 * @property {string} teams_normalized.mascot - Mascot of the team
 * @property {string} teams_normalized.abbreviation - Abbreviation of the team name
 * @property {string} teams_normalized.logo - URL of the team logo
 * @property {number} teams_normalized.conference_id - ID of the team's conference
 * @property {number} teams_normalized.division_id - ID of the team's division
 * @property {number} teams_normalized.ranking - Ranking of the team
 * @property {string} teams_normalized.record - Team's record
 * @property {boolean} teams_normalized.is_away - Indicates if the team is away
 * @property {boolean} teams_normalized.is_home - Indicates if the team is home
 * @property {Object} schedule - Schedule information
 * @property {string} schedule.league_name - Name of the league
 * @property {boolean} schedule.conference_competition - Indicates if it's a conference competition
 * @property {string} schedule.season_type - Type of the season
 * @property {number} schedule.season_year - Year of the season
 * @property {number} schedule.week - Week number of the game
 * @property {string} schedule.week_name - Name of the week
 * @property {string} schedule.week_detail - Detailed information about the week
 * @property {string} schedule.event_name - Name of the event
 * @property {string} schedule.attendance - Attendance information
 */
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
    logo: String,
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
    week: Number,
    week_name: String,
    week_detail: String,
    event_name: String,
    attendance: String
  }
}, { timestamps: true });

// Indexes
GameSchema.index({ event_id: 1 }, { unique: true });
GameSchema.index({ event_date: 1 });

module.exports = mongoose.model('Game', GameSchema);