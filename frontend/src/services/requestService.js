// frontend/src/services/requestService.js

import api from './api';
import logger from '../utils/logger';

const API_URL = '/requests';

export const getRequests = async () => {
  try {
    const response = await api.get(API_URL);
    logger.info('Requests retrieved:', response.data);
    return response.data.data;
  } catch (error) {
    logger.error('Error fetching requests:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const approveRequest = async (requestId) => {
  try {
    const response = await api.put(`${API_URL}/${requestId}/approve`);
    logger.info('Request approved:', response.data);
    return response.data.data;
  } catch (error) {
    logger.error('Error approving request:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const createRequest = async (poolId, numberOfEntries) => {
  try {
    const response = await api.post(API_URL, { poolId, numberOfEntries });
    logger.info('Request created:', response.data);
    return response.data.data;
  } catch (error) {
    logger.error('Error creating request:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const getUserRequests = async () => {
  try {
    const response = await api.get(`${API_URL}/user`);
    logger.info('User requests retrieved:', response.data);
    return response.data.data;
  } catch (error) {
    logger.error('Error fetching user requests:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const confirmPayment = async (requestId, paymentMethod, paymentAmount, paymentConfirmation) => {
  try {
    const response = await api.put(
      `${API_URL}/${requestId}/confirm-payment`,
      { paymentMethod, paymentAmount, paymentConfirmation }
    );
    logger.info('Payment confirmed:', response.data);
    return response.data.data;
  } catch (error) {
    logger.error('Error confirming payment:', error.response ? error.response.data : error.message);
    throw error;
  }
};