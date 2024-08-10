// frontend/src/services/requestService.js

import api from './api';
import logger from '../utils/logger';

const API_URL = '/requests';

export const createRequest = async (poolId, numberOfEntries) => {
  try {
    const response = await api.post(API_URL, { poolId, numberOfEntries });
    logger.info('Request created:', response.data);
    return response.data;
  } catch (error) {
    logger.error('Error creating request:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const confirmPayment = async (requestId, transactionId, paymentType) => {
  try {
    const response = await api.put(`${API_URL}/${requestId}/confirm-payment`, { transactionId, paymentType });
    logger.info('Payment confirmed:', response.data);
    return response.data;
  } catch (error) {
    logger.error('Error confirming payment:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const getUserRequests = async () => {
  try {
    const response = await api.get(API_URL);
    logger.info('User requests retrieved:', response.data);
    return response.data;
  } catch (error) {
    logger.error('Error fetching user requests:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const getRequestById = async (requestId) => {
  try {
    const response = await api.get(`${API_URL}/${requestId}`);
    logger.info('Request retrieved:', response.data);
    return response.data;
  } catch (error) {
    logger.error('Error fetching request:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const getPoolRequests = async (poolId) => {
  try {
    const response = await api.get(`${API_URL}/pool/${poolId}`);
    logger.info('Pool requests retrieved:', response.data);
    return response.data;
  } catch (error) {
    logger.error('Error fetching pool requests:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const approveRequest = async (requestId) => {
  try {
    const response = await api.put(`${API_URL}/${requestId}/approve`);
    logger.info('Request approved:', response.data);
    return response.data;
  } catch (error) {
    logger.error('Error approving request:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const rejectRequest = async (requestId) => {
  try {
    const response = await api.put(`${API_URL}/${requestId}/reject`);
    logger.info('Request rejected:', response.data);
    return response.data;
  } catch (error) {
    logger.error('Error rejecting request:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const getAllRequests = async () => {
  try {
    const response = await api.get(`${API_URL}`);
    logger.info('All requests retrieved:', response.data);
    return response.data; // This should include success, count, and data properties
  } catch (error) {
    logger.error('Error fetching all requests:', error.response ? error.response.data : error.message);
    throw error;
  }
};