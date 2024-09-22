import api from './api';
import logger from '../utils/logger';

export const getTotalEntriesStats = async (poolId) => {
  try {
    const response = await api.get(`/stats/${poolId}/total-entries`);
    return response.data;
  } catch (error) {
    console.error('Error fetching total entries stats:', error);
    throw error;
  }
};

export const getOverallKillRatio = async (poolId, week) => {
  const response = await api.get(`/stats/${poolId}/overall-kill-ratio`, { params: { week } });
  return response.data;
};

export const getKillRatioPerWeek = async (poolId, week) => {
  try {
    const response = await api.get(`/stats/${poolId}/kill-ratio-per-week`, { params: { week } });
    return response.data;
  } catch (error) {
    console.error('Error fetching kill ratio per week:', error);
    throw error;
  }
};

export const getDetailedEntryList = async (poolId, week) => {
  try {
    const response = await api.get(`/stats/${poolId}/detailed-entries`, {
      params: { week }
    });
    return response.data;
  } catch (error) {
    logger.error('Error in getDetailedEntryList:', error);
    throw error;
  }
};