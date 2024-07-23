// frontend/src/services/requestService.js

import axios from 'axios';

const API_URL = 'http://localhost:5000/api/v1/requests';

const authHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getRequests = async () => {
  try {
    const response = await axios.get(API_URL, { headers: authHeader() });
    console.log('Requests retrieved:', response.data);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching requests:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const approveRequest = async (requestId) => {
  try {
    const response = await axios.put(`${API_URL}/${requestId}/approve`, {}, { headers: authHeader() });
    console.log('Request approved:', response.data);
    return response.data.data;
  } catch (error) {
    console.error('Error approving request:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const createRequest = async (poolId, numberOfEntries) => {
  try {
    const response = await axios.post(API_URL, { poolId, numberOfEntries }, { headers: authHeader() });
    console.log('Request created:', response.data);
    return response.data.data;
  } catch (error) {
    console.error('Error creating request:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const getUserRequests = async () => {
  try {
    const response = await axios.get(`${API_URL}/user`, { headers: authHeader() });
    console.log('User requests retrieved:', response.data);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching user requests:', error.response ? error.response.data : error.message);
    throw error;
  }
};