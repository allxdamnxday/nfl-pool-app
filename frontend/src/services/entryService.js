// frontend/src/services/entryService.js

import axios from 'axios';

const API_URL = 'http://localhost:5000/api/v1';

const authHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getUserEntries = async () => {
  try {
    const response = await axios.get(`${API_URL}/entries/user`, { headers: authHeader() });
    console.log('User entries retrieved:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching user entries:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const getEntry = async (entryId) => {
  const response = await axios.get(`${API_URL}/entries/${entryId}`, { headers: authHeader() });
  return response.data.data;
};

export const requestEntry = async (poolId) => {
  const response = await axios.post(`${API_URL}/pools/${poolId}/request-entry`, {}, { headers: authHeader() });
  return response.data.data;
};

export const getEntriesForPool = async (poolId) => {
  const response = await axios.get(`${API_URL}/pools/${poolId}/entries`, { headers: authHeader() });
  return response.data.data;
};

export const updateEntry = async (entryId, entryData) => {
  const response = await axios.put(`${API_URL}/entries/${entryId}`, entryData, { headers: authHeader() });
  return response.data.data;
};