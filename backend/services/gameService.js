/**
 * @module GameService
 */

const axios = require('axios');
const calculateNFLWeek = require('../utils/nflWeekCalculator');

/**
 * Service class for managing games
 * @class GameService
 */
class GameService {
  /**
   * Fetch games for a specific date
   * @async
   * @param {string} date - The date to fetch games for (format: YYYY-MM-DD)
   * @returns {Promise<Array>} Array of processed game objects
   * @throws {Error} If there's an error fetching games
   */
  async fetchGamesForDate(date) {
    const options = {
      method: 'GET',
      url: `https://therundown-therundown-v1.p.rapidapi.com/sports/2/events/${date}`,
      params: { include: 'scores', affiliate_ids: '1,2,3', offset: '0' },
      headers: {
        'x-rapidapi-key': process.env.RAPIDAPI_KEY,
        'x-rapidapi-host': 'therundown-therundown-v1.p.rapidapi.com'
      }
    };

    try {
      const response = await axios.request(options);
      const processedGames = response.data.events.map(event => ({
        ...event,
        schedule: {
          ...event.schedule,
          week: calculateNFLWeek(event.event_date, event.schedule.season_year)
        }
      }));
      return processedGames;
    } catch (error) {
      console.error('Error fetching games:', error);
      throw error;
    }
  }
}

module.exports = new GameService();