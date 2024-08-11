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
    const response = await api.get('/pools/user/active');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching user active pools:', error);
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

export const updatePool = async (poolId, updateData) => {
  try {
    const response = await api.put(`${API_URL}/${poolId}`, updateData);
    logger.info('Pool updated:', response.data);
    return response.data.data;
  } catch (error) {
    logger.error('Error updating pool:', error);
    throw error;
  }
};

export const deletePool = async (poolId) => {
  try {
    const response = await api.delete(`${API_URL}/${poolId}`);
    logger.info('Pool deleted:', response.data);
    return response.data.data;
  } catch (error) {
    logger.error('Error deleting pool:', error);
    throw error;
  }
};

export const getPoolStats = async (poolId) => {
  try {
    const response = await api.get(`${API_URL}/${poolId}/stats`);
    logger.info('Pool stats retrieved:', response.data);
    return response.data.data;
  } catch (error) {
    logger.error('Error fetching pool stats:', error);
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

export const getUserPoolsWithEntries = async () => {
  try {
    const response = await api.get(`${API_URL}/user/entries`);
    logger.info('User pools with entries retrieved:', response.data);
    return response.data.data; // Assuming the API returns { data: PoolWithEntries[] }
  } catch (error) {
    logger.error('Error fetching user pools with entries:', error);
    throw error;
  }
};

export const getPoolEntries = async (poolId) => {
  try {
    const response = await api.get(`${API_URL}/${poolId}/entries`);
    logger.info('Pool entries retrieved:', response.data);
    return response.data.data;
  } catch (error) {
    logger.error('Error fetching pool entries:', error);
    throw error;
  }
};

export const updatePoolStatus = async (poolId, status) => {
  try {
    const response = await api.put(`${API_URL}/${poolId}/status`, { status });
    logger.info('Pool status updated:', response.data);
    return response.data.data;
  } catch (error) {
    logger.error('Error updating pool status:', error);
    throw error;
  }
};