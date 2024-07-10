// __tests__/unit/gameController.test.js
const mongoose = require('mongoose');
const { fetchGames, getGames, getGame, filterGames } = require('../../controllers/games');
const Game = require('../../models/Game');
const rundownApi = require('../../services/rundownApiService');

// Mock dependencies
jest.mock('../../models/Game');
jest.mock('../../services/rundownApiService');

describe('Game Controller', () => {
  describe('fetchGames', () => {
    it('should fetch and store games', async () => {
      const mockReq = {
        body: { date: '2024-09-20', limit: 5 }
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const mockNext = jest.fn();

      rundownApi.fetchNFLSchedule.mockResolvedValue([
        { event_id: 'test1', event_date: '2024-09-20T00:00:00Z' }
      ]);

      await fetchGames(mockReq, mockRes, mockNext);

      expect(rundownApi.fetchNFLSchedule).toHaveBeenCalledWith('2024-09-20', 5);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        count: 1
      }));
    });
  });

  // Add more tests for other controller functions...
});