// frontend/src/services/adminService.js

import api from './api';

export const syncNFLSchedule = async () => {
  const response = await api.post('/admin/sync-schedule');
  return response.data;
};

export const updateGameData = async () => {
  const response = await api.post('/admin/update-game-data');
  return response.data;
};

export const initializeSeasonData = async (year) => {
  const response = await api.post('/admin/initialize-season', { year });
  return response.data;
};