// frontend/src/services/gameService.js
import api from './api';

export const getGamesForWeek = async (week, season_year) => {
  try {
    const response = await api.get(`/games/week?week=${week}&season_year=${season_year}`);
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