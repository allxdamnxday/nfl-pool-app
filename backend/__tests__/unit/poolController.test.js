// __tests__/unit/poolController.test.js
const mongoose = require('mongoose');
const { createPool, getPools, getPool, updatePool, deletePool, joinPool } = require('../../controllers/pools');
const Pool = require('../../models/Pool');
const User = require('../../models/User');

// Mock dependencies
jest.mock('../../models/Pool');
jest.mock('../../models/User');

describe('Pool Controller', () => {
  describe('createPool', () => {
    it('should create a new pool', async () => {
      const mockReq = {
        body: {
          name: 'Test Pool',
          season: 2024,
          maxParticipants: 10,
          entryFee: 50,
          prizeAmount: 450
        },
        user: { id: 'user123' }
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const mockPool = {
        ...mockReq.body,
        creator: mockReq.user.id
      };

      Pool.create.mockResolvedValue(mockPool);

      await createPool(mockReq, mockRes, jest.fn());

      expect(Pool.create).toHaveBeenCalledWith(expect.objectContaining(mockPool));
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockPool
      });
    });
  });

  describe('joinPool', () => {
    it('should allow a user to join a pool', async () => {
      const mockPool = {
        _id: 'pool123',
        participants: [],
        maxParticipants: 10,
        save: jest.fn().mockResolvedValue(true)
      };
      const mockReq = {
        params: { id: 'pool123' },
        user: { id: 'user123' }
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      Pool.findById.mockResolvedValue(mockPool);

      await joinPool(mockReq, mockRes, jest.fn());

      expect(mockPool.participants).toContain('user123');
      expect(mockPool.save).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockPool
      });
    });

    it('should not allow joining if pool is full', async () => {
      const mockPool = {
        _id: 'pool123',
        participants: ['user1', 'user2'],
        maxParticipants: 2
      };
      const mockReq = {
        params: { id: 'pool123' },
        user: { id: 'user3' }
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const mockNext = jest.fn();

      Pool.findById.mockResolvedValue(mockPool);

      await joinPool(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
      expect(mockNext.mock.calls[0][0].statusCode).toBe(400);
    });
  });

  // Add more tests for other pool controller functions...
});