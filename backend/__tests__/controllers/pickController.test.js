const request = require('supertest');
const express = require('express');
const pickRoutes = require('../../routes/picks');
const pickService = require('../../services/pickService');
const { protect } = require('../../middleware/auth');
const checkGameStart = require('../../middleware/checkGameStart');
const ErrorResponse = require('../../utils/errorResponse');
const errorHandler = require('../../middleware/error');

// Mock the pickService
jest.mock('../../services/pickService', () => ({
  addOrUpdatePick: jest.fn(),
  getPicksForWeek: jest.fn(),
  getPicksForEntry: jest.fn(),
  updatePick: jest.fn(),
  deletePick: jest.fn(),
  getPicksForPool: jest.fn(),
  getPickForWeek: jest.fn(), // Added this line
}));

// Mock the middleware
jest.mock('../../middleware/auth', () => ({
  protect: jest.fn((req, res, next) => {
    req.user = { id: 'mockUserId' };
    next();
  })
}));

jest.mock('../../middleware/checkGameStart', () => jest.fn((req, res, next) => next()));

const app = express();
app.use(express.json());
app.use('/api/v1/picks', pickRoutes);
app.use(errorHandler);

describe('Pick Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/picks/pool/:poolId', () => {
    it('should get all picks for a pool', async () => {
      const mockPicks = [
        { _id: 'pick1', entry: 'entry1', team: 'Team A', week: 1 },
        { _id: 'pick2', entry: 'entry2', team: 'Team B', week: 1 }
      ];

      pickService.getPicksForPool.mockResolvedValue(mockPicks);

      const res = await request(app).get('/api/v1/picks/pool/pool1');

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        success: true,
        count: mockPicks.length,
        data: mockPicks
      });
      expect(pickService.getPicksForPool).toHaveBeenCalledWith('pool1');
    });

    it('should handle errors when getting picks for a pool', async () => {
      pickService.getPicksForPool.mockRejectedValue(new ErrorResponse('Pool not found', 404));

      const res = await request(app).get('/api/v1/picks/pool/nonexistent');

      expect(res.statusCode).toBe(404);
      expect(res.body).toEqual({
        success: false,
        error: 'Pool not found'
      });
    });
  });

  describe('GET /api/v1/picks/:entryId/:entryNumber/:week', () => {
    it('should get a pick for a specific week', async () => {
      const mockPick = { _id: 'pick1', entry: 'entry1', entryNumber: 1, team: 'Team A', week: 1 };

      pickService.getPickForWeek.mockResolvedValue(mockPick);

      const res = await request(app).get('/api/v1/picks/entry1/1/1');

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        success: true,
        data: mockPick
      });
      expect(pickService.getPickForWeek).toHaveBeenCalledWith('entry1', '1', '1');
    });

    it('should handle errors when getting a pick for a specific week', async () => {
      pickService.getPickForWeek.mockRejectedValue(new ErrorResponse('Pick not found', 404));

      const res = await request(app).get('/api/v1/picks/nonexistent/1/1');

      expect(res.statusCode).toBe(404);
      expect(res.body).toEqual({
        success: false,
        error: 'Pick not found'
      });
    });
  });

  describe('PUT /api/v1/picks/:entryId/:entryNumber/:week', () => {
    it('should update a pick', async () => {
      const mockUpdatedPick = {
        _id: 'pick1',
        entry: 'entry1',
        entryNumber: 1,
        team: 'Team B',
        week: 1
      };

      pickService.updatePick.mockResolvedValue(mockUpdatedPick);

      const res = await request(app)
        .put('/api/v1/picks/entry1/1/1')
        .send({ team: 'Team B' });

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        success: true,
        data: mockUpdatedPick
      });
      expect(pickService.updatePick).toHaveBeenCalledWith('entry1', '1', '1', 'mockUserId', { team: 'Team B' });
    });

    it('should handle errors when updating a pick', async () => {
      pickService.updatePick.mockRejectedValue(new ErrorResponse('Cannot update pick after game has started', 400));

      const res = await request(app)
        .put('/api/v1/picks/entry1/1/1')
        .send({ team: 'Team B' });

      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({
        success: false,
        error: 'Cannot update pick after game has started'
      });
    });
  });

  describe('DELETE /api/v1/picks/:entryId/:entryNumber/:week', () => {
    it('should delete a pick', async () => {
      pickService.deletePick.mockResolvedValue();

      const res = await request(app).delete('/api/v1/picks/entry1/1/1');

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        success: true,
        data: {}
      });
      expect(pickService.deletePick).toHaveBeenCalledWith('entry1', '1', '1', 'mockUserId');
    });

    it('should handle errors when deleting a pick', async () => {
      pickService.deletePick.mockRejectedValue(new ErrorResponse('Pick not found', 404));

      const res = await request(app).delete('/api/v1/picks/nonexistent/1/1');

      expect(res.statusCode).toBe(404);
      expect(res.body).toEqual({
        success: false,
        error: 'Pick not found'
      });
    });
  });
});