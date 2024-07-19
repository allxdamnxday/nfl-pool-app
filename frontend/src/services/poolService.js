// frontend/src/services/poolService.js
import axios from 'axios';

import axios from 'axios';

const API_URL = 'http://localhost:5000/api/v1/pools';

const authHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getActivePools = async () => {
  const response = await axios.get(`${API_URL}?status=active`, { headers: authHeader() });
  return response.data.data;
};

export const getAllPools = async () => {
  const response = await axios.get(API_URL, { headers: authHeader() });
  return response.data.data;
};

export const getPoolDetails = async (poolId) => {
  const response = await axios.get(`${API_URL}/${poolId}`, { headers: authHeader() });
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