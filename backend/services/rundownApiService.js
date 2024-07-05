// backend/services/rundownApiService.js
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

exports.fetchNFLSchedule = async (date) => {
  try {
    const response = await api.get(`/sports/${config.SPORT_ID.NFL}/events/${date}`);
    return response.data.events;
  } catch (error) {
    console.error('Error fetching NFL schedule:', error);
    throw error;
  }
};

exports.fetchEventDetails = async (eventId) => {
  try {
    const response = await api.get(`/events/${eventId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching event details:', error);
    throw error;
  }
};

exports.fetchOdds = async (eventId) => {
  try {
    const response = await api.get(`/events/${eventId}/odds`);
    return response.data;
  } catch (error) {
    console.error('Error fetching odds:', error);
    throw error;
  }
};

// Add more functions as needed for other endpoints