// frontend/src/services/poolService.js
import api from './api';

export const getAvailablePools = async () => {
  try {
    const response = await api.get('/pools/available');
    console.log('Available pools retrieved:', response.data);
    return response.data.data; // Assuming the API returns { data: [...pools] }
  } catch (error) {
    console.error('Error fetching available pools:', error);
    throw error;
  }
};

export const getUserActivePools = async () => {
  try {
    const response = await api.get('/pools/user/active');
    console.log('User active pools retrieved:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching user active pools:', error);
    throw error;
  }
};

export const getPoolDetails = async (poolId) => {
  try {
    const response = await api.get(`/pools/${poolId}`);
    console.log('Pool details retrieved:', response.data);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching pool details:', error);
    throw error;
  }
};

export const createJoinRequest = async (poolId, numberOfEntries = 1) => {
  try {
    const response = await api.post(`/pools/${poolId}/join`, { numberOfEntries });
    console.log('Join request created:', response.data);
    return response.data.data;
  } catch (error) {
    console.error('Error creating join request:', error);
    throw error;
  }
};

export const getActivePools = async () => {
  try {
    const response = await api.get('/pools?status=active');
    console.log('Active pools retrieved:', response.data);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching active pools:', error);
    throw error;
  }
};

export const getAllPools = async () => {
  try {
    const response = await api.get('/pools');
    console.log('All pools retrieved:', response.data);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching all pools:', error);
    throw error;
  }
};

export const createPool = async (poolData) => {
  try {
    const response = await api.post('/pools', poolData);
    console.log('Pool created:', response.data);
    return response.data.data;
  } catch (error) {
    console.error('Error creating pool:', error);
    throw error;
  }
};

export const getUserPools = async () => {
  try {
    const response = await api.get('/pools/user');
    console.log('User pools retrieved:', response.data);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching user pools:', error);
    throw error;
  }
};