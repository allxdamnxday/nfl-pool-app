/**
 * @module RundownApiService
 */

const axios = require('axios');
const config = require('../config/rundownApi');
const logger = require('../utils/logger');
const moment = require('moment-timezone');

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
    AFFILIATE_ID: 1, // Replace with your actual affiliate ID
    API_KEY: '1701031eb1mshc800e3940304359p1bd6ccjsn44c6f4718739', // Replace with your actual API key
    API_HOST: 'therundown-therundown-v1.p.rapidapi.com'
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
    const options = {
      method: 'GET',
      url: `https://${rundownApi.config.API_HOST}/sports/${rundownApi.config.SPORT_ID.NFL}/events/${date}`,
      params: {
        include: 'scores',
        affiliate_ids: `${rundownApi.config.AFFILIATE_ID},`,
        offset: '0'
      },
      headers: {
        'x-rapidapi-key': rundownApi.config.API_KEY,
        'x-rapidapi-host': rundownApi.config.API_HOST
      }
    };

    try {
      logger.info(`Making API request to: ${options.url}`);
      const response = await axios.request(options);
      logger.info(`Received ${response.data.events.length} events for ${date}`);
      
      return response.data.events.map(game => ({
        event_id: game.event_id,
        event_date: game.event_date,
        teams_normalized: game.teams_normalized,
        lines: game.lines?.[rundownApi.config.AFFILIATE_ID],
        odds: game.lines?.[rundownApi.config.AFFILIATE_ID],
        favored_team: game.lines?.[rundownApi.config.AFFILIATE_ID]?.spread?.point_spread_away < 0 
          ? game.teams_normalized.find(t => t.is_away).name 
          : game.teams_normalized.find(t => t.is_home).name
      }));
    } catch (error) {
      logger.error(`Error fetching NFL events for ${date}:`, error.message);
      throw error;
    }
  },

  fetchNFLEventsRange: async (fromDate, toDate) => {
    const events = [];
    let currentDate = new Date(fromDate);

    while (currentDate <= toDate) {
      try {
        const dailyEvents = await rundownApi.fetchNFLEvents(currentDate);
        events.push(...dailyEvents);
      } catch (error) {
        logger.error(`Error fetching NFL events for ${currentDate.toISOString()}:`, error.message);
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return events;
  },

  fetchNFLEventsForSeason: async (startDate, numberOfGameDays = 50) => {
    const events = [];
    let currentDate = moment.tz(startDate, 'UTC');
    let gameDaysCount = 0;

    while (gameDaysCount < numberOfGameDays) {
      const dayOfWeek = currentDate.day();
      
      // Check if it's Thursday (4), Sunday (0), or Monday (1)
      if (dayOfWeek === 4 || dayOfWeek === 0 || dayOfWeek === 1) {
        try {
          const dailyEvents = await rundownApi.fetchNFLEvents(currentDate.toDate());
          events.push(...dailyEvents);
          gameDaysCount++;
        } catch (error) {
          logger.error(`Error fetching NFL events for ${currentDate.format()}:`, error.message);
        }
      }

      currentDate.add(1, 'days');
    }

    return events;
  }
};

module.exports = rundownApi;