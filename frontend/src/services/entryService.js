// frontend/src/services/entryService.js
import api from './api';
import logger from '../utils/logger';

const API_URL = '/entries';

export const getUserEntries = async () => {
  try {
    const response = await api.get(`${API_URL}/user`);
    logger.info('User entries retrieved:', response.data);
    return response.data.data;
  } catch (error) {
    logger.error('Error fetching user entries:', error);
    throw error;
  }
};

export const getEntry = async (entryId) => {
  try {
    const response = await api.get(`${API_URL}/${entryId}`);
    return response.data.data;
  } catch (error) {
    logger.error('Error fetching entry:', error);
    throw error;
  }
};

export const getEntriesForPool = async (poolId) => {
  try {
    const response = await api.get(`/pools/${poolId}/entries`);
    return response.data.data;
  } catch (error) {
    logger.error('Error fetching entries for pool:', error);
    throw error;
  }
};

export const getUserEntriesWithPicks = async () => {
  try {
    const response = await api.get(`${API_URL}/user/with-picks?populate=picks.game`);
    return response.data.data;
  } catch (error) {
    logger.error('Error fetching user entries with picks:', error);
    throw error;
  }
};