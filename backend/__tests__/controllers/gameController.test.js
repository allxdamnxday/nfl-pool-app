const request = require('supertest');
const express = require('express');
const asyncHandler = require('../../middleware/async');
const seasonService = require('../../services/seasonService');
const gamesController = require('../../controllers/games');

jest.mock('../../services/seasonService');

const app = express();
app.use(express.json());

// Helper function to create route handlers
const createRoute = (method, path, handler) => {
  app[method](path, asyncHandler(handler));
};

// Set up routes
createRoute('get', '/api/games/current-week', gamesController.getCurrentWeekGames);
createRoute('get', '/api/games/:seasonYear/:week', gamesController.getGamesForWeek);
createRoute('put', '/api/games/update', gamesController.updateGameData);
createRoute('post', '/api/games/initialize', gamesController.initializeSeasonData);
createRoute('get', '/api/games/current-week-number', gamesController.getCurrentNFLWeek);
createRoute('get', '/api/games/current-season-year', gamesController.getCurrentSeasonYear);

describe('Games Controller', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/games/current-week', () => {
    it('should return current week games', async () => {
      const mockGames = [{ id: 1, home_team: 'Team A', away_team: 'Team B' }];
      seasonService.getCurrentWeekGames.mockResolvedValue(mockGames);

      const response = await request(app).get('/api/games/current-week');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        count: 1,
        data: mockGames
      });
      expect(seasonService.getCurrentWeekGames).toHaveBeenCalled();
    });
  });

  describe('GET /api/games/:seasonYear/:week', () => {
    it('should return games for a specific week and season', async () => {
      const mockGames = [{ id: 1, home_team: 'Team A', away_team: 'Team B' }];
      seasonService.getGamesByWeek.mockResolvedValue(mockGames);

      const response = await request(app).get('/api/games/2023/1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        count: 1,
        data: mockGames
      });
      expect(seasonService.getGamesByWeek).toHaveBeenCalledWith(1, 2023);
    });
  });

  describe('PUT /api/games/update', () => {
    it('should update game data', async () => {
      seasonService.updateGameData.mockResolvedValue();

      const response = await request(app).put('/api/games/update');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        message: 'Game data updated successfully'
      });
      expect(seasonService.updateGameData).toHaveBeenCalled();
    });
  });

  describe('POST /api/games/initialize', () => {
    it('should initialize season data', async () => {
      const mockResult = { upsertedCount: 272, modifiedCount: 0 };
      seasonService.initializeSeasonData.mockResolvedValue(mockResult);

      const response = await request(app)
        .post('/api/games/initialize')
        .send({ year: 2023 });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        message: 'Season data initialized successfully',
        data: mockResult
      });
      expect(seasonService.initializeSeasonData).toHaveBeenCalledWith(2023);
    });
  });

  describe('GET /api/games/current-week-number', () => {
    it('should return the current NFL week', async () => {
      seasonService.getCurrentNFLWeek.mockResolvedValue(7);

      const response = await request(app).get('/api/games/current-week-number');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: { currentWeek: 7 }
      });
      expect(seasonService.getCurrentNFLWeek).toHaveBeenCalled();
    });
  });

  describe('GET /api/games/current-season-year', () => {
    it('should return the current NFL season year', async () => {
      seasonService.getCurrentSeasonYear.mockResolvedValue(2023);

      const response = await request(app).get('/api/games/current-season-year');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: { currentSeasonYear: 2023 }
      });
      expect(seasonService.getCurrentSeasonYear).toHaveBeenCalled();
    });
  });
});