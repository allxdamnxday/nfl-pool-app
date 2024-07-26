// frontend/src/services/pickService.js

import axios from 'axios';

const API_URL = 'http://localhost:5000/api/v1';

const authHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const addPick = async (entryId, team) => {
  const response = await axios.post(`${API_URL}/entries/${entryId}/picks`, { team }, { headers: authHeader() });
  return response.data.data;
};

export const getGamesForWeek = async () => {
  const response = await axios.get(`${API_URL}/games/current-week`, { headers: authHeader() });
  return response.data.data;
};

export const getPicksForPool = async (poolId) => {
  const response = await axios.get(`${API_URL}/pools/${poolId}/picks`, { headers: authHeader() });
  return response.data.data;
};

export const getPickForWeek = async (entryId, week) => {
  const response = await axios.get(`${API_URL}/entries/${entryId}/picks/${week}`, { headers: authHeader() });
  return response.data.data;
};

export const updatePick = async (entryId, pickId, pickData) => {
  const response = await axios.put(`${API_URL}/entries/${entryId}/picks/${pickId}`, pickData, { headers: authHeader() });
  return response.data.data;
};

export const deletePick = async (entryId, pickId) => {
  const response = await axios.delete(`${API_URL}/entries/${entryId}/picks/${pickId}`, { headers: authHeader() });
  return response.data.data;
};