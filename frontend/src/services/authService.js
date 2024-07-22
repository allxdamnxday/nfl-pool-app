// frontend/src/services/authService.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/v1/auth';

export const login = async (email, password) => {
  try {
    console.log(`Attempting login for email: ${email}`); // Added logging
    const response = await axios.post(`${API_URL}/login`, { email, password });
    console.log('Login response:', response.data); // Added logging
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      console.log('User role after login:', response.data.user.role); // Added logging
    }
    return response.data;
  } catch (error) {
    console.error('Login error:', error.response ? error.response.data : error.message); // Added logging
    throw error;
  }
};

export const register = async ({ firstName, lastName, username, email, password }) => {
  const response = await axios.post(`${API_URL}/register`, { firstName, lastName, username, email, password });
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    console.log('User role after registration:', response.data.user.role); // Added logging
  }
  return response.data;
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const getCurrentUser = async () => {
  const user = localStorage.getItem('user');
  if (user) {
    console.log('User role from localStorage:', JSON.parse(user).role); // Added logging
    return JSON.parse(user);
  }

  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    const response = await axios.get(`${API_URL}/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    localStorage.setItem('user', JSON.stringify(response.data.data));
    console.log('User role after fetching current user:', response.data.data.role); // Added logging
    return response.data.data;
  } catch (error) {
    console.error('Failed to get current user:', error);
    return null;
  }
};