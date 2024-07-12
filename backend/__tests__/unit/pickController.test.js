// __tests__/unit/pickController.test.js
const mongoose = require('mongoose');
const { addPick, getPicksForPool, getPickForWeek, updatePick, deletePick } = require('../../controllers/picks');
const Pick = require('../../models/Pick');
const Pool = require('../../models/Pool');
const Game = require('../../models/Game');
const UserPoolStats = require('../../models/UserPoolStats');
const ErrorResponse = require('../../utils/errorResponse');

// Mock dependencies
jest.mock('../../models/Pick');
jest.mock('../../models/Pool');
jest.mock('../../models/Game');
jest.mock('../../models/UserPoolStats');

describe('Pick Controller', () => {

  describe('addPick', () => {
    it('should add a new pick', async () => {
      const mockPool = {
        _id: 'pool123',
        participants: ['user123']
      };
      const mockGame = {
        _id: 'game123',
        week: 1
      };
      const mockReq = {
        params: { poolId: 'pool123' },
        body: {
          game: 'game123',
          team: 'team123',
          market: 'market123',
          lineValue: -3.5,
          odds: -110
        },
        user: { id: 'user123' }
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const mockPick = {
        user: 'user123',
        pool: 'pool123',
        weekNumber: 1,
        team: 'team123',
        game: 'game123',
        market: 'market123',
        lineValue: -3.5,
        odds: -110
      };

      Pool.findById.mockResolvedValue(mockPool);
      Game.findById.mockResolvedValue(mockGame);
      Pick.findOne.mockResolvedValue(null);
      Pick.create.mockResolvedValue(mockPick);
      UserPoolStats.findOneAndUpdate.mockResolvedValue({});

      await addPick(mockReq, mockRes, jest.fn());

      expect(Pick.create).toHaveBeenCalledWith(expect.objectContaining(mockPick));
      expect(UserPoolStats.findOneAndUpdate).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockPick
      });
    });

    it('should not allow duplicate picks for the same week', async () => {
      const mockPool = {
        _id: 'pool123',
        participants: ['user123']
      };
      const mockGame = {
        _id: 'game123',
        week: 1
      };
      const mockReq = {
        params: { poolId: 'pool123' },
        body: {
          game: 'game123',
          team: 'team123'
        },
        user: { id: 'user123' }
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const mockNext = jest.fn();

      Pool.findById.mockResolvedValue(mockPool);
      Game.findById.mockResolvedValue(mockGame);
      Pick.findOne.mockResolvedValue({ _id: 'existingPick' });

      await addPick(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ErrorResponse));
      expect(mockNext.mock.calls[0][0].statusCode).toBe(400);
    });
  });

  describe('getPicksForPool', () => {
    it('should return all picks for a pool', async () => {
      const mockReq = {
        params: { poolId: 'pool123' }
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const mockPicks = [{ _id: 'pick1' }, { _id: 'pick2' }];
  
      // Create a mock function that returns itself to simulate chaining
      const mockPopulate = jest.fn();
  
      // Mock the final return value of the chained method
      Pick.find = jest.fn().mockReturnValue({
        populate: mockPopulate
          .mockReturnValueOnce({ populate: mockPopulate })
          .mockReturnValueOnce({ populate: mockPopulate })
          .mockReturnValueOnce({ populate: mockPopulate })
          .mockResolvedValueOnce(mockPicks)
      });
  
      await getPicksForPool(mockReq, mockRes, jest.fn());
  
      expect(Pick.find).toHaveBeenCalledWith({ pool: 'pool123' });
      expect(mockPopulate).toHaveBeenCalledTimes(4);
      expect(mockPopulate).toHaveBeenNthCalledWith(1, 'user', 'username');
      expect(mockPopulate).toHaveBeenNthCalledWith(2, 'team', 'name');
      expect(mockPopulate).toHaveBeenNthCalledWith(3, 'game', 'homeTeam awayTeam eventDate');
      expect(mockPopulate).toHaveBeenNthCalledWith(4, 'market', 'name');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        count: mockPicks.length,
        data: mockPicks
      });
    });
  });
  
  

  describe('getPickForWeek', () => {
    it('should return a pick for a specific week', async () => {
      const mockReq = {
        params: { poolId: 'pool123', week: '1' },
        user: { id: 'user123' }
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const mockPick = { _id: 'pick1', weekNumber: 1 };
  
      Pool.findById.mockResolvedValue({ _id: 'pool123' });
      Pick.findOne.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockPick)
      });
  
      await getPickForWeek(mockReq, mockRes, jest.fn());
  
      expect(Pool.findById).toHaveBeenCalledWith('pool123');
      expect(Pick.findOne).toHaveBeenCalledWith({
        pool: 'pool123',
        user: 'user123',
        weekNumber: '1'
      });
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockPick
      });
    });
  
    it('should return 404 if no pick is found', async () => {
      const mockReq = {
        params: { poolId: 'pool123', week: '1' },
        user: { id: 'user123' }
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const mockNext = jest.fn();
  
      Pool.findById.mockResolvedValue({ _id: 'pool123' });
      Pick.findOne.mockReturnValue({
        populate: jest.fn().mockResolvedValue(null)
      });
  
      await getPickForWeek(mockReq, mockRes, mockNext);
  
      expect(mockNext).toHaveBeenCalledWith(expect.any(ErrorResponse));
      expect(mockNext.mock.calls[0][0].statusCode).toBe(404);
    });
  });
  
  describe('updatePick', () => {
    it('should update a pick', async () => {
      const mockReq = {
        params: { id: 'pick123' },
        user: { id: 'user123' },
        body: { team: 'newTeam123' }
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const mockPick = { 
        _id: 'pick123', 
        user: 'user123',
        team: 'newTeam123'
      };
  
      Pick.findById.mockResolvedValue({ ...mockPick, user: 'user123' });
      Pick.findByIdAndUpdate.mockResolvedValue(mockPick);
  
      await updatePick(mockReq, mockRes, jest.fn());
  
      expect(Pick.findById).toHaveBeenCalledWith('pick123');
      expect(Pick.findByIdAndUpdate).toHaveBeenCalledWith('pick123', { team: 'newTeam123' }, {
        new: true,
        runValidators: true
      });
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockPick
      });
    });
  });

  // Add these tests to your pickController.test.js file

describe('Error Handling', () => {
  it('should handle trying to add a pick to a non-existent pool', async () => {
    const mockReq = {
      params: { poolId: 'nonexistentpool' },
      body: { game: 'game123', team: 'team123' },
      user: { id: 'user123' }
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const mockNext = jest.fn();

    Pool.findById.mockResolvedValue(null);

    await addPick(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(ErrorResponse));
    expect(mockNext.mock.calls[0][0].statusCode).toBe(404);
  });

  it('should handle trying to add a pick for a non-existent game', async () => {
    const mockReq = {
      params: { poolId: 'pool123' },
      body: { game: 'nonexistentgame', team: 'team123' },
      user: { id: 'user123' }
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const mockNext = jest.fn();

    Pool.findById.mockResolvedValue({ _id: 'pool123', participants: ['user123'] });
    Game.findById.mockResolvedValue(null);

    await addPick(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(ErrorResponse));
    expect(mockNext.mock.calls[0][0].statusCode).toBe(404);
  });
});
  
  describe('deletePick', () => {
    it('should delete a pick', async () => {
      const mockReq = {
        params: { id: 'pick123' },
        user: { id: 'user123' }
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const mockPick = { 
        _id: 'pick123', 
        user: 'user123',
        remove: jest.fn().mockResolvedValue(true)
      };
  
      Pick.findById.mockResolvedValue(mockPick);
  
      await deletePick(mockReq, mockRes, jest.fn());
  
      expect(Pick.findById).toHaveBeenCalledWith('pick123');
      expect(mockPick.remove).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: {}
      });
    });
  });
  // ... add more tests for getPickForWeek, updatePick, and deletePick ...
})

