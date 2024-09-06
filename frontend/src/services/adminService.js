// frontend/src/services/adminService.js

import api from './api';

export const syncNFLSchedule = async () => {
  const response = await api.post('/admin/sync-schedule');
  return response.data;
};

export const updateGameData = async (date) => {
  const response = await api.post('/admin/update-game-data', { date });
  return response.data;
};

export const initializeSeasonData = async (year) => {
  const response = await api.post('/admin/initialize-season', { year });
  return response.data;
};

// New function to run the closing service
export const runClosingService = async (date) => {
  const response = await api.post('/season/run-closing-service', { date });
  return response.data;
};