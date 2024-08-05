/**
 * @module RundownApiService
 */

const axios = require('axios');
const config = require('../config/rundownApi');

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
    AFFILIATE_ID: 3 // Assuming 3 is the affiliate we want
  },

  /**
   * Fetch NFL schedule
   * @async
   * @param {Date|string} fromDate - The start date for the schedule
   * @param {number} [limit=400] - The maximum number of results to return
   * @returns {Promise<Array>} Array of NFL schedule data
   * @throws {Error} If there's an error fetching the schedule
   */
  fetchNFLSchedule: async (fromDate, limit = 400) => {
    try {
      const url = `/sports/${rundownApi.config.SPORT_ID.NFL}/schedule`;
      const response = await api.get(url, {
        params: { 
          from: formatDateISO8601(fromDate),
          limit: limit
        }
      });
      
      return response.data.schedules;
    } catch (error) {
      console.error('Error fetching NFL schedule:', error.message);
      throw error;
    }
  },

  /**
   * Fetch details for a specific event
   * @async
   * @param {string} eventId - The ID of the event
   * @returns {Promise<Object|null>} The event details or null if not found
   * @throws {Error} If there's an error fetching the event details
   */
  fetchEventDetails: async (eventId) => {
    try {
      const response = await api.get(`/events/${eventId}`, {
        params: {
          include: 'all_periods'
        }
      });

      const eventData = response.data;
      const affiliateLines = eventData.lines[rundownApi.config.AFFILIATE_ID];

      if (!affiliateLines) {
        console.warn(`No lines found for affiliate ${rundownApi.config.AFFILIATE_ID}`);
        return null;
      }

      return {
        event_id: eventData.event_id,
        sport_id: eventData.sport_id,
        event_date: eventData.event_date,
        away_team: eventData.teams_normalized[0],
        home_team: eventData.teams_normalized[1],
        total: affiliateLines.total ? affiliateLines.total.total_over : null,
        event_status: eventData.score.event_status,
        score_away: eventData.score.score_away,
        score_home: eventData.score.score_home,
        broadcast: eventData.score.broadcast,
        venue_name: eventData.score.venue_name,
        venue_location: eventData.score.venue_location
      };
    } catch (error) {
      console.error('Error fetching event details:', error.message);
      throw error;
    }
  },

  /**
   * Fetch NFL events for a specific date
   * @async
   * @param {Date|string} date - The date to fetch events for
   * @returns {Promise<Array>} Array of NFL events
   * @throws {Error} If there's an error fetching the events
   */
  fetchNFLEvents: async (date) => {
    try {
      const url = `/sports/${rundownApi.config.SPORT_ID.NFL}/events/${formatDateISO8601(date)}`;
      const response = await api.get(url, {
        params: {
          include: 'all_periods'
        }
      });
      
      return response.data.events;
    } catch (error) {
      console.error('Error fetching NFL events:', error.message);
      throw error;
    }
  }
};

module.exports = rundownApi;