const axios = require('axios');
const config = require('../config/rundownApi');

const api = axios.create({
  baseURL: config.BASE_URL,
  headers: {
    'x-rapidapi-key': config.RAPID_API_KEY,
    'x-rapidapi-host': config.RAPID_API_HOST
  }
});


exports.fetchDates = async () => {
    try {
      const response = await api.get('/sports/1/dates');
      return response.data.dates;
    } catch (error) {
      console.error('Error fetching dates:', error);
      throw error;
    }
  };
  
  exports.fetchEventsForDate = async (date) => {
    try {
      const response = await api.get(`/sports/1/events/${date}`);
      return response.data.events; // Adjust if the property name is different
    } catch (error) {
      console.error(`Error fetching events for date ${date}:`, error);
      throw error;
    }
  };

exports.fetchNFLTeams = async () => {
  try {
    const response = await api.get(`/sports/${config.SPORT_ID.NFL}/teams`);
    return response.data.teams;
  } catch (error) {
    console.error('Error fetching NFL teams:', error);
    throw error;
  }
};

exports.fetchNFLSchedule = async (fromDate, limit = 10) => {
    try {
      const response = await api.get(`/sports/${config.SPORT_ID.NFL}/events`, {
        params: {
          include: 'all_periods',
          offset: '240',
          from: fromDate,
          limit: limit.toString()
        }
      });
      
      if (response.data && response.data.events) {
        return response.data.events;
      } else {
        console.error('Unexpected API response structure:', response.data);
        throw new Error('Unexpected API response structure');
      }
    } catch (error) {
      console.error('Error fetching NFL schedule:', error.response ? error.response.data : error.message);
      throw error;
    }
  };

exports.fetchEventMarkets = async (eventId, participantType, marketIds) => {
  try {
    const response = await api.get(`/events/${eventId}/markets`, {
      params: { 
        participant_type: participantType,
        market_ids: marketIds.join(',')
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching event markets:', error);
    throw error;
  }
};

exports.fetchEventDetails = async (eventId, marketIds) => {
  try {
    const response = await api.get(`/events/${eventId}`, {
      params: { market_ids: marketIds.join(',') }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching event details:', error);
    throw error;
  }
};

exports.fetchTeamPlayers = async (teamId) => {
  try {
    const response = await api.get(`/teams/${teamId}/players`);
    return response.data.players;
  } catch (error) {
    console.error('Error fetching team players:', error);
    throw error;
  }
};