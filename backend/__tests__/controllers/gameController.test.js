const request = require('supertest');
const express = require('express');
const gameRoutes = require('../../routes/games');
const seasonService = require('../../services/seasonService');
const { protect } = require('../../middleware/auth');
const ErrorResponse = require('../../utils/errorResponse');
const errorHandler = require('../../middleware/error');

// Mock the seasonService
jest.mock('../../services/seasonService', () => ({
  initializeSeasonData: jest.fn(),
  updateGameData: jest.fn(),
  getGamesByWeek: jest.fn(),
  getCurrentWeekGames: jest.fn(),
  getSetting: jest.fn(),
  updateSetting: jest.fn(),
  calculateNFLWeek: jest.fn(),
  getCurrentSeasonYear: jest.fn(),
  getCurrentNFLWeek: jest.fn()
}));

// Mock the middleware
jest.mock('../../middleware/auth', () => ({
  protect: jest.fn((req, res, next) => {
    req.user = { id: 'mockUserId' };
    next();
  })
}));

const app = express();
app.use(express.json());
app.use('/api/v1/games', gameRoutes);
app.use(errorHandler);

describe('Games Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/games/current-week', () => {
    it('should get games for the current week', async () => {
      const mockGames = [
        { event_id: '1', away_team: 'Team A', home_team: 'Team B' },
        { event_id: '2', away_team: 'Team C', home_team: 'Team D' }
      ];
      seasonService.getCurrentWeekGames.mockResolvedValue(mockGames);

      const res = await request(app).get('/api/v1/games/current-week');

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        success: true,
        count: 2,
        data: mockGames
      });
    });

    it('should handle errors when getting current week games', async () => {
      seasonService.getCurrentWeekGames.mockRejectedValue(new ErrorResponse('Error fetching games', 500));

      const res = await request(app).get('/api/v1/games/current-week');

      expect(res.statusCode).toBe(500);
      expect(res.body).toEqual({
        success: false,
        error: 'Error fetching games'
      });
    });
  });

  describe('GET /api/v1/games/week/:seasonYear/:week', () => {
    it('should get games for a specific week and season', async () => {
      const mockGames = [
        { event_id: '1', away_team: 'Team A', home_team: 'Team B' },
        { event_id: '2', away_team: 'Team C', home_team: 'Team D' }
      ];
      seasonService.getGamesByWeek.mockResolvedValue(mockGames);

      const res = await request(app).get('/api/v1/games/week/2023/3');

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        success: true,
        count: 2,
        data: mockGames
      });
      expect(seasonService.getGamesByWeek).toHaveBeenCalledWith(3, 2023);
    });
  });

  describe('PUT /api/v1/games/update-data', () => {
    it('should update game data', async () => {
      seasonService.updateGameData.mockResolvedValue();

      const res = await request(app).put('/api/v1/games/update-data');

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        success: true,
        message: 'Game data updated successfully'
      });
    });
  });

  describe('POST /api/v1/games/initialize-season', () => {
    it('should initialize season data', async () => {
      const mockResult = { upsertedCount: 272, modifiedCount: 0 };
      seasonService.initializeSeasonData.mockResolvedValue(mockResult);

      const res = await request(app)
        .post('/api/v1/games/initialize-season')
        .send({ year: 2023 });

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        success: true,
        message: 'Season data initialized successfully',
        data: mockResult
      });
      expect(seasonService.initializeSeasonData).toHaveBeenCalledWith(2023);
    });
  });
});