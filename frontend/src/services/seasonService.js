// frontend/src/services/seasonService.js

import api from './api';

export const getCurrentWeekNumber = async () => {
  try {
    const response = await api.get('/season/current-week-number');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching current week number:', error);
    throw error;
  }
};