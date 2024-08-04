// frontend/src/services/poolService.js
import api from './api';
import logger from '../utils/logger';

const API_URL = '/pools';

export const getAvailablePools = async () => {
  try {
    const response = await api.get(`${API_URL}/available`);
    logger.info('Available pools retrieved:', response.data);
    return response.data.data;
  } catch (error) {
    logger.error('Error fetching available pools:', error);
    throw error;
  }
};

export const getUserActivePools = async () => {
  try {
    const response = await api.get(`${API_URL}/user/active`);
    logger.info('User active pools retrieved:', response.data);
    return response.data.data;
  } catch (error) {
    logger.error('Error fetching user active pools:', error);
    throw error;
  }
};

export const getPoolDetails = async (poolId) => {
  try {
    const response = await api.get(`${API_URL}/${poolId}`);
    logger.info('Pool details retrieved:', response.data);
    return response.data.data;
  } catch (error) {
    logger.error('Error fetching pool details:', error);
    throw error;
  }
};

export const createJoinRequest = async (poolId, numberOfEntries = 1) => {
  try {
    const response = await api.post(`${API_URL}/${poolId}/join`, { numberOfEntries });
    logger.info('Join request created:', response.data);
    return response.data.data;
  } catch (error) {
    logger.error('Error creating join request:', error);
    throw error;
  }
};

export const getActivePools = async () => {
  try {
    const response = await api.get(`${API_URL}?status=active`);
    logger.info('Active pools retrieved:', response.data);
    return response.data.data;
  } catch (error) {
    logger.error('Error fetching active pools:', error);
    throw error;
  }
};

export const getAllPools = async () => {
  try {
    const response = await api.get(API_URL);
    logger.info('All pools retrieved:', response.data);
    return response.data.data;
  } catch (error) {
    logger.error('Error fetching all pools:', error);
    throw error;
  }
};

export const createPool = async (poolData) => {
  try {
    const response = await api.post(API_URL, poolData);
    logger.info('Pool created:', response.data);
    return response.data.data;
  } catch (error) {
    logger.error('Error creating pool:', error);
    throw error;
  }
};

export const getUserPools = async () => {
  try {
    const response = await api.get(`${API_URL}/user`);
    logger.info('User pools retrieved:', response.data);
    return response.data.data;
  } catch (error) {
    logger.error('Error fetching user pools:', error);
    throw error;
  }
};