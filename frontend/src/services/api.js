// frontend/src/services/api.js

import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.PROD ? '' : 'http://localhost:5000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Handle unauthorized access (e.g., redirect to login)
      // You might want to use your router here instead of window.location
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;