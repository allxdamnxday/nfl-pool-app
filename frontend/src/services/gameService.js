// frontend/src/services/gameService.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/v1/games'; // Update this if your backend URL is different

const authHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getGames = async () => {
  const response = await axios.get(API_URL, { headers: authHeader() });
  return response.data.data;
};

export const getGameDetails = async (gameId) => {
  const response = await axios.get(`${API_URL}/${gameId}`, { headers: authHeader() });
  return response.data.data;
};