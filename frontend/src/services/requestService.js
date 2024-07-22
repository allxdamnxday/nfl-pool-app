// frontend/src/services/requestService.js

import axios from 'axios';

const API_URL = 'http://localhost:5000/api/v1/requests';

const authHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getRequests = async () => {
  const response = await axios.get(API_URL, { headers: authHeader() });
  return response.data.data;
};

export const approveRequest = async (requestId) => {
  const response = await axios.put(`${API_URL}/${requestId}/approve`, {}, { headers: authHeader() });
  return response.data.data;
};

export const createRequest = async (poolId, numberOfEntries) => {
  const response = await axios.post(API_URL, { poolId, numberOfEntries }, { headers: authHeader() });
  return response.data.data;
};