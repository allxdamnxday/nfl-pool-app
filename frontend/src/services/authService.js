// frontend/src/services/authService.js
import api from './api';

const AUTH_URL = '/auth';

export const login = async (email, password) => {
  try {
    console.log(`Attempting login for email: ${email}`);
    const response = await api.post(`${AUTH_URL}/login`, { email, password });
    console.log('Login response:', response.data);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      console.log('User role after login:', response.data.user.role);
    }
    return response.data;
  } catch (error) {
    console.error('Login error:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const register = async ({ firstName, lastName, username, email, password }) => {
  try {
    const response = await api.post(`${AUTH_URL}/register`, { firstName, lastName, username, email, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      console.log('User role after registration:', response.data.user.role);
    }
    return response.data;
  } catch (error) {
    console.error('Registration error:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const getCurrentUser = async () => {
  try {
    const response = await api.get(`${AUTH_URL}/me`);
    localStorage.setItem('user', JSON.stringify(response.data.data));
    console.log('User data from server:', response.data.data);
    return response.data.data;
  } catch (error) {
    console.error('Failed to get current user:', error);
    return null;
  }
};

export const forgotPassword = async (email) => {
  try {
    const response = await api.post(`${AUTH_URL}/forgotpassword`, { email });
    return response.data;
  } catch (error) {
    console.error('Forgot password error:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const resetPassword = async (resettoken, password) => {
  try {
    const response = await api.put(`${AUTH_URL}/resetpassword/${resettoken}`, { password });
    return response.data;
  } catch (error) {
    console.error('Reset password error:', error.response ? error.response.data : error.message);
    throw error;
  }
};