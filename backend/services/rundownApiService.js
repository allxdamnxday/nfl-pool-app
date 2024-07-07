// /services/rundownApiService.js
const axios = require('axios');
const config = require('../config/rundownApi');

const api = axios.create({
  baseURL: config.BASE_URL,
  headers: {
    'x-rapidapi-key': config.RAPID_API_KEY,
    'x-rapidapi-host': config.RAPID_API_HOST
  }
});


exports.fetchNFLTeams = async () => {
  try {
    const response = await api.get(`/sports/${config.SPORT_ID.NFL}/teams`);
    return response.data.teams;
  } catch (error) {
    console.error('Error fetching NFL teams:', error);
    throw error;
  }
};

exports.fetchNFLSchedule = async (fromDate, limit = 100) => {
    try {
      const url = `/sports/${config.SPORT_ID.NFL}/schedule?from=${fromDate}&limit=${limit}`;
      const response = await api.get(url);
      
      if (response.data && response.data.schedules) {
        return response.data.schedules;
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