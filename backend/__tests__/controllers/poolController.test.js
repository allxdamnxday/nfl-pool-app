const request = require('supertest');
const express = require('express');
const poolRoutes = require('../../routes/pools');
const PoolService = require('../../services/poolService');
const { protect, authorize } = require('../../middleware/auth');
const ErrorResponse = require('../../utils/errorResponse');
const errorHandler = require('../../middleware/error');

// Mock the PoolService
jest.mock('../../services/poolService');

// Mock the middleware
jest.mock('../../middleware/auth', () => ({
  protect: jest.fn((req, res, next) => {
    req.user = { id: 'mockUserId' };
    next();
  }),
  authorize: jest.fn(() => (req, res, next) => next())
}));

// Mock the advancedResults middleware
jest.mock('../../middleware/advancedResults', () => () => (req, res, next) => {
  res.advancedResults = {
    success: true,
    count: 2,
    pagination: {},
    data: [
      { _id: 'pool1', name: 'Pool 1' },
      { _id: 'pool2', name: 'Pool 2' }
    ]
  };
  next();
});

const app = express();
app.use(express.json());
app.use('/api/v1/pools', poolRoutes);
app.use(errorHandler);

describe('Pool Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/pools', () => {
    it('should get all pools', async () => {
      const res = await request(app).get('/api/v1/pools');

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        success: true,
        count: 2,
        pagination: {},
        data: [
          { _id: 'pool1', name: 'Pool 1' },
          { _id: 'pool2', name: 'Pool 2' }
        ]
      });
    });
  });

  describe('GET /api/v1/pools/:id', () => {
    it('should get a single pool', async () => {
      const mockPool = { _id: 'pool1', name: 'Pool 1' };

      PoolService.getById.mockResolvedValue(mockPool);

      const res = await request(app).get('/api/v1/pools/pool1');

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        success: true,
        data: mockPool
      });
    });

    it('should handle errors when getting a single pool', async () => {
      PoolService.getById.mockRejectedValue(new ErrorResponse('Pool not found', 404));

      const res = await request(app).get('/api/v1/pools/nonexistent');

      expect(res.statusCode).toBe(404);
      expect(res.body).toEqual({
        success: false,
        error: 'Pool not found'
      });
    });
  });

  describe('POST /api/v1/pools', () => {
    it('should create a new pool', async () => {
      const mockPool = {
        name: 'New Pool',
        season: 2023,
        maxParticipants: 100,
        entryFee: 50,
        prizeAmount: 4500
      };
      const mockCreatedPool = { _id: 'newpool', ...mockPool };

      PoolService.createPool.mockResolvedValue(mockCreatedPool);

      const res = await request(app)
        .post('/api/v1/pools')
        .send(mockPool);

      expect(res.statusCode).toBe(201);
      expect(res.body).toEqual({
        success: true,
        data: mockCreatedPool
      });
      expect(PoolService.createPool).toHaveBeenCalledWith('mockUserId', mockPool);
    });

    it('should handle errors when creating a pool', async () => {
      const mockPool = { name: 'Invalid Pool' };

      PoolService.createPool.mockRejectedValue(new ErrorResponse('Invalid pool data', 400));

      const res = await request(app)
        .post('/api/v1/pools')
        .send(mockPool);

      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({
        success: false,
        error: 'Invalid pool data'
      });
    });
  });

  describe('PUT /api/v1/pools/:id', () => {
    it('should update a pool', async () => {
      const mockUpdatedPool = {
        _id: 'pool1',
        name: 'Updated Pool',
        season: 2023
      };

      PoolService.updatePool.mockResolvedValue(mockUpdatedPool);

      const res = await request(app)
        .put('/api/v1/pools/pool1')
        .send({ name: 'Updated Pool' });

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        success: true,
        data: mockUpdatedPool
      });
      expect(PoolService.updatePool).toHaveBeenCalledWith('pool1', 'mockUserId', { name: 'Updated Pool' });
    });
  });

  describe('DELETE /api/v1/pools/:id', () => {
    it('should delete a pool', async () => {
      PoolService.deletePool.mockResolvedValue({});

      const res = await request(app).delete('/api/v1/pools/pool1');

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        success: true,
        data: {}
      });
      expect(PoolService.deletePool).toHaveBeenCalledWith('pool1', 'mockUserId');
    });
  });

  describe('GET /api/v1/pools/:id/stats', () => {
    it('should get pool statistics', async () => {
      const mockStats = {
        totalParticipants: 50,
        eliminatedParticipants: 10,
        currentWeek: 3
      };

      PoolService.getPoolStats.mockResolvedValue(mockStats);

      const res = await request(app).get('/api/v1/pools/pool1/stats');

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        success: true,
        data: mockStats
      });
      expect(PoolService.getPoolStats).toHaveBeenCalledWith('pool1');
    });
  });

  describe('GET /api/v1/pools/available', () => {
    it('should get available pools for the user', async () => {
      const mockAvailablePools = [
        { _id: 'pool1', name: 'Available Pool 1' },
        { _id: 'pool2', name: 'Available Pool 2' }
      ];

      PoolService.getAvailablePools.mockResolvedValue(mockAvailablePools);

      const res = await request(app).get('/api/v1/pools/available');

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        success: true,
        count: mockAvailablePools.length,
        data: mockAvailablePools
      });
      expect(PoolService.getAvailablePools).toHaveBeenCalledWith('mockUserId');
    });
  });

  describe('PUT /api/v1/pools/:id/status', () => {
    it('should update pool status', async () => {
      const mockUpdatedPool = {
        _id: 'pool1',
        name: 'Pool 1',
        status: 'active'
      };

      PoolService.updatePoolStatus.mockResolvedValue(mockUpdatedPool);

      const res = await request(app)
        .put('/api/v1/pools/pool1/status')
        .send({ status: 'active' });

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        success: true,
        data: mockUpdatedPool
      });
      expect(PoolService.updatePoolStatus).toHaveBeenCalledWith('pool1', 'active');
    });
  });

  describe('GET /api/v1/pools/user/active', () => {
    it('should get active pools for a user', async () => {
      const mockActivePools = [
        { _id: 'pool1', name: 'Active Pool 1' },
        { _id: 'pool2', name: 'Active Pool 2' }
      ];

      PoolService.getUserActivePools.mockResolvedValue(mockActivePools);

      const res = await request(app).get('/api/v1/pools/user/active');

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        success: true,
        count: mockActivePools.length,
        data: mockActivePools
      });
      expect(PoolService.getUserActivePools).toHaveBeenCalledWith('mockUserId');
    });
  });

  describe('GET /api/v1/pools/user', () => {
    it('should get all pools for the current user', async () => {
      const mockUserPools = [
        { _id: 'pool1', name: 'User Pool 1' },
        { _id: 'pool2', name: 'User Pool 2' }
      ];

      PoolService.getUserPools.mockResolvedValue(mockUserPools);

      const res = await request(app).get('/api/v1/pools/user');

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        success: true,
        count: mockUserPools.length,
        data: mockUserPools
      });
      expect(PoolService.getUserPools).toHaveBeenCalledWith('mockUserId');
    });
  });

  describe('GET /api/v1/pools/user/entries', () => {
    it('should get pools with entries for the current user', async () => {
      const mockPoolsWithEntries = [
        { _id: 'pool1', name: 'Pool 1', entries: [{ _id: 'entry1' }] },
        { _id: 'pool2', name: 'Pool 2', entries: [{ _id: 'entry2' }, { _id: 'entry3' }] }
      ];

      PoolService.getUserPoolsWithEntries.mockResolvedValue(mockPoolsWithEntries);

      const res = await request(app)
        .get('/api/v1/pools/user/entries')
        .set('Authorization', 'Bearer fake-token');

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        success: true,
        data: mockPoolsWithEntries
      });
      expect(PoolService.getUserPoolsWithEntries).toHaveBeenCalledWith('mockUserId');
    });
  });

  describe('GET /api/v1/pools/:id/entries', () => {
    it('should get entries for a specific pool', async () => {
      const mockEntries = [
        { _id: 'entry1', user: 'user1' },
        { _id: 'entry2', user: 'user2' }
      ];

      PoolService.getPoolEntries.mockResolvedValue(mockEntries);

      const res = await request(app)
        .get('/api/v1/pools/pool1/entries')
        .set('Authorization', 'Bearer fake-token');

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        success: true,
        count: mockEntries.length,
        data: mockEntries
      });
      expect(PoolService.getPoolEntries).toHaveBeenCalledWith('pool1');
    });
  });
});