// frontend/src/services/gameService.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/v1/games';

const authHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getGameDetails = async (gameId) => {
  const response = await axios.get(`${API_URL}/${gameId}`, { headers: authHeader() });
  return response.data.data;
};

export const getGameMarkets = async (gameId) => {
  const response = await axios.get(`${API_URL}/${gameId}/markets`, { headers: authHeader() });
  return response.data.data;
};