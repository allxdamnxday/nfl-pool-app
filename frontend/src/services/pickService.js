// frontend/src/services/pickService.js

import api from './api';

const authHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const addOrUpdatePick = async (entryId, team, week) => {
  try {
    const response = await api.post(`/entries/${entryId}/picks`, { team, week });
    return response.data.data;
  } catch (error) {
    console.error('Error adding/updating pick:', error);
    throw error;
  }
};

export const getGamesForWeek = async () => {
  try {
    const response = await api.get(`/games/current-week`, { headers: authHeader() });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching games for week:', error);
    if (error.response && error.response.status === 404) {
      return []; // Return an empty array if no games are found
    }
    throw error;
  }
};

export const getPicksForPool = async (poolId) => {
  const response = await api.get(`/pools/${poolId}/picks`, { headers: authHeader() });
  return response.data.data;
};

export const getPickForWeek = async (entryId, week) => {
  try {
    const response = await api.get(`/entries/${entryId}/picks/${week}`, { headers: authHeader() });
    return response.data.data; // This might be null if no pick is found
  } catch (error) {
    console.error('Error fetching pick:', error);
    return null;
  }
};

export const updatePick = async (entryId, pickId, pickData) => {
  const response = await api.put(`/entries/${entryId}/picks/${pickId}`, pickData, { headers: authHeader() });
  return response.data.data;
};

export const deletePick = async (entryId, pickId) => {
  const response = await api.delete(`/entries/${entryId}/picks/${pickId}`, { headers: authHeader() });
  return response.data.data;
};