// frontend/src/services/gameService.js
import api from './api';

export const getGamesForWeek = async (date) => {
  try {
    const response = await api.get(`/games/week?date=${date}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching games:', error);
    throw error;
  }
};

export const getCurrentWeekGames = async () => {
  try {
    const response = await api.get('/games/current-week');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching current week games:', error);
    throw error;
  }
};