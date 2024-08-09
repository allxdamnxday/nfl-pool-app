/**
 * @module RundownApiService
 */

const axios = require('axios');
const config = require('../config/rundownApi');
const logger = require('../utils/logger');

/**
 * Format a date to ISO 8601 string
 * @param {Date|string} date - The date to format
 * @returns {string} The formatted date string
 */
const formatDateISO8601 = (date) => {
  if (typeof date === 'string') {
    // If it's already a string, assume it's in the correct format
    return date;
  }
  return date.toISOString();
};

/**
 * Axios instance for Rundown API
 * @type {AxiosInstance}
 */
const api = axios.create({
  baseURL: config.BASE_URL,
  headers: {
    'x-rapidapi-key': config.RAPID_API_KEY,
    'x-rapidapi-host': config.RAPID_API_HOST
  }
});

/**
 * Rundown API service
 * @namespace
 */
const rundownApi = {
  config: {
    ...config,
    SPORT_ID: {
      NFL: 2
    },
    AFFILIATE_ID: 4 // Based on the response, affiliate_id is 4
  },

  fetchNFLSchedule: async (fromDate, limit = 400) => {
    try {
      const url = `/sports/${rundownApi.config.SPORT_ID.NFL}/schedule`;
      const response = await api.get(url, {
        params: { 
          from: formatDateISO8601(fromDate),
          limit: limit
        }
      });
      
      return response.data.schedules.map(game => ({
        event_id: game.event_id,
        event_uuid: game.event_uuid,
        sport_id: game.sport_id,
        event_date: game.date_event,
        away_team_id: game.away_team_id,
        home_team_id: game.home_team_id,
        away_team: game.away_team,
        home_team: game.home_team,
        neutral_site: game.neutral_site,
        season_type: game.season_type,
        season_year: game.season_year,
        score: {
          away_score: game.away_score,
          home_score: game.home_score,
        },
        league_name: game.league_name,
        event_name: game.event_name,
        broadcast: game.broadcast,
        event_location: game.event_location,
        attendance: game.attendance,
        updated_at: game.updated_at
      }));
    } catch (error) {
      logger.error('Error fetching NFL schedule:', error.message);
      throw error;
    }
  },

  fetchNFLEvents: async (date) => {
    try {
      const url = `/sports/${rundownApi.config.SPORT_ID.NFL}/events/${formatDateISO8601(date)}`;
      const response = await api.get(url, {
        params: {
          include: 'all_periods,scores',
          affiliate_ids: rundownApi.config.AFFILIATE_ID.toString(),
          offset: '0'
        }
      });
      
      return response.data.events.map(game => ({
        event_id: game.event_id,
        event_uuid: game.event_uuid,
        sport_id: game.sport_id,
        event_date: game.event_date,
        rotation_number_away: game.rotation_number_away,
        rotation_number_home: game.rotation_number_home,
        score: {
          event_status: game.score.event_status,
          winner_away: game.score.winner_away,
          winner_home: game.score.winner_home,
          score_away: game.score.score_away,
          score_home: game.score.score_home,
          score_away_by_period: game.score.score_away_by_period,
          score_home_by_period: game.score.score_home_by_period,
          venue_name: game.score.venue_name,
          venue_location: game.score.venue_location,
          game_clock: game.score.game_clock,
          display_clock: game.score.display_clock,
          game_period: game.score.game_period,
          broadcast: game.score.broadcast,
          event_status_detail: game.score.event_status_detail,
          updated_at: game.score.updated_at
        },
        teams: game.teams.map(team => ({
          team_id: team.team_id,
          team_normalized_id: team.team_normalized_id,
          name: team.name,
          is_away: team.is_away,
          is_home: team.is_home
        })),
        teams_normalized: game.teams_normalized.map(team => ({
          team_id: team.team_id,
          name: team.name,
          mascot: team.mascot,
          abbreviation: team.abbreviation,
          conference_id: team.conference_id,
          division_id: team.division_id,
          ranking: team.ranking,
          record: team.record,
          is_away: team.is_away,
          is_home: team.is_home,
          conference: team.conference,
          division: team.division
        })),
        schedule: {
          league_name: game.schedule.league_name,
          conference_competition: game.schedule.conference_competition,
          season_type: game.schedule.season_type,
          season_year: game.schedule.season_year,
          event_name: game.schedule.event_name,
          attendance: game.schedule.attendance
        },
        lines: game.lines?.[rundownApi.config.AFFILIATE_ID]
      }));
    } catch (error) {
      logger.error('Error fetching NFL events:', error.message);
      throw error;
    }
  }
};

module.exports = rundownApi;