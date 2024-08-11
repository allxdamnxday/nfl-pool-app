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
    logger.info('Entry retrieved:', response.data);
    return response.data.data;
  } catch (error) {
    logger.error('Error fetching entry:', error);
    throw error;
  }
};

export const getEntriesForPool = async (poolId) => {
  try {
    const response = await api.get(`/pools/${poolId}/entries`);
    logger.info('Entries for pool retrieved:', response.data);
    return response.data.data;
  } catch (error) {
    logger.error('Error fetching entries for pool:', error);
    throw error;
  }
};

export const addOrUpdatePick = async (entryId, team, week) => {
  try {
    const response = await api.post(`${API_URL}/${entryId}/picks`, { team, week });
    logger.info('Pick added or updated:', response.data);
    return response.data.data;
  } catch (error) {
    logger.error('Error adding or updating pick:', error);
    throw error;
  }
};

export const getPickForWeek = async (entryId, entryNumber, week) => {
  try {
    const response = await api.get(`${API_URL}/${entryId}/${entryNumber}/picks/${week}`);
    logger.info('Pick for week retrieved:', response.data);
    return response.data.data;
  } catch (error) {
    logger.error('Error fetching pick for week:', error);
    throw error;
  }
};

export const getUserEntriesWithPicks = async (populate = '') => {
  try {
    const response = await api.get(`${API_URL}/user/with-picks`, { params: { populate } });
    logger.info('User entries with picks retrieved:', response.data);
    return response.data.data;
  } catch (error) {
    logger.error('Error fetching user entries with picks:', error);
    throw error;
  }
};