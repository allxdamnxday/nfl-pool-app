// __tests__/checkGameStart.test.js
const moment = require('moment');
const mongoose = require('mongoose');
const pickService = require('../../services/pickService');
const Game = require('../../models/Game');
const Pick = require('../../models/Pick');
const ErrorResponse = require('../../utils/errorResponse');
const checkGameStart = require('../../middleware/checkGameStart');

// Mock dependencies
jest.mock('../../models/Game');
jest.mock('../../services/seasonService', () => ({
  getCurrentNFLWeek: jest.fn().mockReturnValue({ week: 5, seasonYear: 2023 })
}));
jest.mock('../../utils/logger');

describe('checkGameStart Middleware', () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    mockReq = {
      params: { entryId: 'entry123', entryNumber: '1', week: '5' },
      body: { team: 'Patriots' }
    };
    mockRes = {};
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  it('should allow pick when game starts more than 5 minutes in the future', async () => {
    const mockGame = {
      _id: 'game789',
      event_date: moment().add(10, 'minutes').toDate(),
      schedule: { week: 5, season_year: 2023 }
    };
    Game.findOne.mockResolvedValue(mockGame);

    await checkGameStart(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalledWith();
    expect(mockReq.game).toEqual(mockGame);
    expect(mockReq.gameStartTime).toBeDefined();
  });

  it('should not allow pick when game starts within 5 minutes', async () => {
    const mockGame = {
      _id: 'game789',
      event_date: moment().add(4, 'minutes').toDate(),
      schedule: { week: 5, season_year: 2023 }
    };
    Game.findOne.mockResolvedValue(mockGame);

    await checkGameStart(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(ErrorResponse));
    expect(mockNext.mock.calls[0][0].message).toBe('Cannot modify pick within 5 minutes of game start or after the game has begun');
    expect(mockNext.mock.calls[0][0].statusCode).toBe(400);
  });

  it('should not allow pick when game has already started', async () => {
    const mockGame = {
      _id: 'game789',
      event_date: moment().subtract(1, 'minute').toDate(),
      schedule: { week: 5, season_year: 2023 }
    };
    Game.findOne.mockResolvedValue(mockGame);

    await checkGameStart(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(ErrorResponse));
    expect(mockNext.mock.calls[0][0].message).toBe('Cannot modify pick within 5 minutes of game start or after the game has begun');
    expect(mockNext.mock.calls[0][0].statusCode).toBe(400);
  });

  it('should handle case when no game is found', async () => {
    Game.findOne.mockResolvedValue(null);

    await checkGameStart(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(ErrorResponse));
    expect(mockNext.mock.calls[0][0].message).toMatch(/No game found for team Patriots in week 5 of season 2023/);
    expect(mockNext.mock.calls[0][0].statusCode).toBe(404);
  });

  it('should use current week if week is not provided in params', async () => {
    mockReq.params.week = undefined;
    const mockGame = {
      _id: 'game789',
      event_date: moment().add(10, 'minutes').toDate(),
      schedule: { week: 5, season_year: 2023 }
    };
    Game.findOne.mockResolvedValue(mockGame);

    await checkGameStart(mockReq, mockRes, mockNext);

    expect(Game.findOne).toHaveBeenCalledWith(expect.objectContaining({
      'schedule.week': 5,
      'schedule.season_year': 2023
    }));
    expect(mockNext).toHaveBeenCalledWith();
  });
});