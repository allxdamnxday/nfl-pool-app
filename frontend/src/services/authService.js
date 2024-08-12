// frontend/src/services/authService.js
import api from './api';

const AUTH_URL = '/auth';

export const login = async (email, password) => {
  try {
    const response = await api.post(`${AUTH_URL}/login`, { email, password });
    if (response.data.success && response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      return response.data;
    } else {
      throw new Error(response.data.message || 'Login failed');
    }
  } catch (error) {
    if (error.response && error.response.status === 403) {
      throw new Error('Email not verified');
    }
    throw new Error(error.response?.data?.message || error.message || 'Login failed');
  }
};

export const register = async ({ firstName, lastName, username, email, password }) => {
  try {
    const response = await api.post(`${AUTH_URL}/register`, { firstName, lastName, username, email, password });
    // Remove token and user storage
    // Instead, return the response data which should include a success message
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
  const token = localStorage.getItem('token');
  if (!token) {
    return null;
  }

  try {
    const response = await api.get(`${AUTH_URL}/me`);
    const userData = response.data.data;
    localStorage.setItem('user', JSON.stringify(userData));
    return userData;
  } catch (error) {
    console.error('Failed to get current user:', error);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    throw error;
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

export const verifyEmail = async (token) => {
  try {
    const response = await api.get(`${AUTH_URL}/verify-email/${token}`);
    return response.data;
  } catch (error) {
    console.error('Email verification error:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const resendVerificationEmail = async (email) => {
  try {
    const response = await api.post(`${AUTH_URL}/resend-verification`, { email });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'Failed to resend verification email');
  }
};