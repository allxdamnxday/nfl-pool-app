// frontend/src/services/pickService.js

import api from './api';
import logger from '../utils/logger';

const API_URL = '/entries';

export const addOrUpdatePick = async (entryId, team, week) => {
  try {
    const response = await api.post(`${API_URL}/${entryId}/picks`, { team, week });
    logger.info('Pick added/updated:', response.data);
    return response.data.data;
  } catch (error) {
    logger.error('Error adding/updating pick:', error);
    throw error;
  }
};

export const getGamesForWeek = async (seasonYear, week) => {
  try {
    logger.info('Fetching games for:', { seasonYear, week });
    const url = `/games/week/${seasonYear}/${week}`;
    const response = await api.get(url);
    logger.info('Games retrieved:', response.data);
    return response.data.data;
  } catch (error) {
    logger.error('Error fetching games for week:', error);
    if (error.response && error.response.status === 404) {
      return []; // Return an empty array if no games are found
    }
    throw error;
  }
};

export const getPickForWeek = async (entryId, week) => {
  try {
    const response = await api.get(`${API_URL}/${entryId}/picks/${week}`);
    logger.info('Pick retrieved:', response.data);
    return response.data.data;
  } catch (error) {
    logger.error('Error fetching pick for week:', error);
    if (error.response && error.response.status === 404) {
      return null; // Return null if no pick is found
    }
    throw error;
  }
};