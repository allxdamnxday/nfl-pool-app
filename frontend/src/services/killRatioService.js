import api from './api';

export const killRatioService = {
  getKillRatioSheet: async (poolId) => {
    try {
      const response = await api.get(`/pool/${poolId}/sheet`);
      return response.data;
    } catch (error) {
      console.error('Error fetching kill ratio sheet:', error);
      throw error;
    }
  },

  getWeeklyKillRatio: async (poolId, week) => {
    try {
      const response = await api.get(`/pool/${poolId}/week/${week}`, {
        params: { includeFullTeamNames: true }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching weekly kill ratio:', error);
      throw error;
    }
  },

  calculateWeeklyKillRatio: async (poolId, week) => {
    try {
      const response = await api.post(`/pool/${poolId}/week/${week}/calculate`);
      return response.data;
    } catch (error) {
      console.error('Error calculating weekly kill ratio:', error);
      throw error;
    }
  }
};

export default killRatioService;