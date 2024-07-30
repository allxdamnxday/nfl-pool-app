// frontend/src/services/entryService.js
import api from './api';

export const getUserEntries = async () => {
  try {
    const response = await api.get('/entries/user');
    console.log('User entries retrieved:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching user entries:', error);
    throw error;
  }
};

export const getEntry = async (entryId) => {
  try {
    const response = await api.get(`/entries/${entryId}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching entry:', error);
    throw error;
  }
};

export const requestEntry = async (poolId) => {
  try {
    const response = await api.post(`/pools/${poolId}/request-entry`);
    return response.data.data;
  } catch (error) {
    console.error('Error requesting entry:', error);
    throw error;
  }
};

export const getEntriesForPool = async (poolId) => {
  try {
    const response = await api.get(`/pools/${poolId}/entries`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching entries for pool:', error);
    throw error;
  }
};

export const updateEntry = async (entryId, entryData) => {
  try {
    const response = await api.put(`/entries/${entryId}`, entryData);
    return response.data.data;
  } catch (error) {
    console.error('Error updating entry:', error);
    throw error;
  }
};

export const getPoolEntries = async (poolId) => {
  try {
    const response = await api.get(`/pools/${poolId}/entries`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching pool entries:', error);
    throw error;
  }
};

export const getUserEntriesWithPicks = async () => {
  try {
    const response = await api.get('/entries/user/with-picks?populate=picks.game');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching user entries with picks:', error);
    throw error;
  }
};