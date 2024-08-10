// frontend/src/services/gameService.js
import api from './api';

export const getGamesForWeek = async (seasonYear, week) => {
  try {
    const response = await api.get(`/games/week/${seasonYear}/${week}`);
    return response.data.games;
  } catch (error) {
    console.error('Error fetching games:', error);
    throw error;
  }
};

export const getCurrentWeekGames = async () => {
  try {
    const response = await api.get('/games/current-week');
    return response.data.games;
  } catch (error) {
    console.error('Error fetching current week games:', error);
    throw error;
  }
};

export const updateGameData = async () => {
  try {
    const response = await api.put('/games/update-data');
    return response.data;
  } catch (error) {
    console.error('Error updating game data:', error);
    throw error;
  }
};

export const initializeSeasonData = async (seasonYear) => {
  try {
    const response = await api.post('/games/initialize-season', { seasonYear });
    return response.data;
  } catch (error) {
    console.error('Error initializing season data:', error);
    throw error;
  }
};