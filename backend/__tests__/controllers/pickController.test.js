const request = require('supertest');
const express = require('express');
const pickRoutes = require('../../routes/picks');
const pickService = require('../../services/pickService');
const { protect, authorize } = require('../../middleware/auth');
const checkGameStart = require('../../middleware/checkGameStart');
const ErrorResponse = require('../../utils/errorResponse');

// Mock the dependencies
jest.mock('../../services/pickService', () => ({
  getPicksForPool: jest.fn(),
  getPickForWeek: jest.fn(),
  updatePick: jest.fn(),
  deletePick: jest.fn()
}));

jest.mock('../../middleware/auth', () => ({
  protect: jest.fn((req, res, next) => {
    req.user = { id: 'mockUserId' };
    next();
  }),
  authorize: jest.fn(() => (req, res, next) => next())
}));
jest.mock('../../middleware/checkGameStart', () => jest.fn((req, res, next) => next()));
jest.mock('../../utils/errorResponse');

// Set up express app for testing
const app = express();
app.use(express.json());
app.use('/api/v1/picks', pickRoutes);


describe('Pick Controller', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
  
    describe('GET /api/v1/picks/pool/:poolId', () => {
      it('should get all picks for a pool', async () => {
        const mockPicks = [
          { _id: 'pick1', team: 'Team A', week: 1 },
          { _id: 'pick2', team: 'Team B', week: 2 }
        ];
        pickService.getPicksForPool.mockResolvedValue(mockPicks);
  
        const res = await request(app).get('/api/v1/picks/pool/poolId123');
  
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({
          success: true,
          count: 2,
          data: mockPicks
        });
        expect(pickService.getPicksForPool).toHaveBeenCalledWith('poolId123');
      });

      it('should handle errors when getting picks for a pool', async () => {
        pickService.getPicksForPool.mockRejectedValue(new Error('Failed to get picks'));

        const res = await request(app).get('/api/v1/picks/pool/poolId123');

        expect(res.statusCode).toBe(500);
        expect(res.body).toEqual({
          success: false,
          error: 'Failed to get picks'
        });
      });
    });
  
    describe('GET /api/v1/picks/:entryId/:entryNumber/:week', () => {
      it('should get pick for a specific week', async () => {
        const mockPick = { _id: 'pick1', team: 'Team A', week: 1 };
        pickService.getPickForWeek.mockResolvedValue(mockPick);
  
        const res = await request(app).get('/api/v1/picks/entry123/1/1');
  
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({
          success: true,
          data: mockPick
        });
        expect(pickService.getPickForWeek).toHaveBeenCalledWith('entry123', '1', '1');
      });

      it('should handle errors when getting pick for a specific week', async () => {
        pickService.getPickForWeek.mockRejectedValue(new Error('Failed to get pick'));

        const res = await request(app).get('/api/v1/picks/entry123/1/1');

        expect(res.statusCode).toBe(500);
        expect(res.body).toEqual({
          success: false,
          error: 'Failed to get pick'
        });
      });
    });
  
    describe('PUT /api/v1/picks/:entryId/:entryNumber/:week', () => {
      it('should update a pick', async () => {
        const mockUpdatedPick = { _id: 'pick1', team: 'Team B', week: 1 };
        pickService.updatePick.mockResolvedValue(mockUpdatedPick);
  
        const res = await request(app)
          .put('/api/v1/picks/entry123/1/1')
          .send({ team: 'Team B' });
  
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({
          success: true,
          data: mockUpdatedPick
        });
        expect(pickService.updatePick).toHaveBeenCalledWith('entry123', '1', '1', 'mockUserId', { team: 'Team B' });
      });

      it('should handle errors when updating a pick', async () => {
        pickService.updatePick.mockRejectedValue(new Error('Failed to update pick'));

        const res = await request(app)
          .put('/api/v1/picks/entry123/1/1')
          .send({ team: 'Team B' });

        expect(res.statusCode).toBe(500);
        expect(res.body).toEqual({
          success: false,
          error: 'Failed to update pick'
        });
      });
    });
  
    describe('DELETE /api/v1/picks/:entryId/:entryNumber/:week', () => {
      it('should delete a pick', async () => {
        pickService.deletePick.mockResolvedValue();
  
        const res = await request(app).delete('/api/v1/picks/entry123/1/1');
  
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({
          success: true,
          data: {}
        });
        expect(pickService.deletePick).toHaveBeenCalledWith('entry123', '1', '1', 'mockUserId');
      });

      it('should handle errors when deleting a pick', async () => {
        pickService.deletePick.mockRejectedValue(new Error('Failed to delete pick'));

        const res = await request(app).delete('/api/v1/picks/entry123/1/1');

        expect(res.statusCode).toBe(500);
        expect(res.body).toEqual({
          success: false,
          error: 'Failed to delete pick'
        });
      });
    });
  });