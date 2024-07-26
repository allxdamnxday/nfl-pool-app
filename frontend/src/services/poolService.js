// frontend/src/services/poolService.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/v1/pools';

const authHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getAvailablePools = async () => {
  try {
    console.log('Fetching available pools from:', `${API_URL}/available`);
    const response = await axios.get(`${API_URL}/available`, { headers: authHeader() });
    console.log('Response:', response.data);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching available pools:', error.response ? error.response.data : error.message);
    console.error('Full error object:', error);
    throw error;
  }
};

export const getUserActivePools = async (userId) => {
  const response = await axios.get(`${API_URL}/user/${userId}/active`, { headers: authHeader() });
  return response.data.data;
};

export const getPoolDetails = async (poolId) => {
  const response = await axios.get(`${API_URL}/${poolId}`, { headers: authHeader() });
  return response.data.data;
};

export const createJoinRequest = async (poolId, numberOfEntries = 1) => {
  const response = await axios.post(`${API_URL}/${poolId}/join`, { numberOfEntries }, { headers: authHeader() });
  return response.data.data;
};

export const getActivePools = async () => {
  const response = await axios.get(`${API_URL}?status=active`, { headers: authHeader() });
  return response.data.data;
};

export const getActivePool = async () => {
  const response = await axios.get(`${API_URL}/active`, { headers: authHeader() });
  return response.data.data;
};

export const getAllPools = async () => {
  const response = await axios.get(API_URL, { headers: authHeader() });
  return response.data.data;
};

export const createPool = async (poolData) => {
  const response = await axios.post(API_URL, poolData, { headers: authHeader() });
  return response.data.data;
};

export const joinPool = async (poolId) => {
  const response = await axios.post(`${API_URL}/${poolId}/join`, {}, { headers: authHeader() });
  return response.data.data;
};

export const getUserPools = async () => {
  try {
    console.log('Fetching user pools');
    const response = await axios.get(`${API_URL}/user`, { headers: authHeader() });
    console.log('User pools response:', response.data);
    
    // The backend should now return pools with the correct activeEntries count
    return response.data.data;
  } catch (error) {
    console.error('Error fetching user pools:', error.response ? error.response.data : error.message);
    console.error('Full error object:', error);
    throw error;
  }
};