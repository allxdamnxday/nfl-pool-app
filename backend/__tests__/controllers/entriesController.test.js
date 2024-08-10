const request = require('supertest');
const express = require('express');
const entryRoutes = require('../../routes/entries');
const EntryService = require('../../services/entryService');
const { protect, authorize } = require('../../middleware/auth');
const ErrorResponse = require('../../utils/errorResponse');
const errorHandler = require('../../middleware/error');
const checkGameStart = require('../../middleware/checkGameStart');

// Mock the EntryService
jest.mock('../../services/entryService', () => ({
  getUserEntries: jest.fn(),
  getUserEntriesForPool: jest.fn(),
  getEntry: jest.fn(),
  getEntriesForPool: jest.fn(),
  addOrUpdatePick: jest.fn(),
  getPickForWeek: jest.fn(),
  getUserEntriesWithPicks: jest.fn(),
  eliminateEntry: jest.fn()
}));

// Mock the middleware
jest.mock('../../middleware/auth', () => ({
  protect: jest.fn((req, res, next) => {
    req.user = { id: 'mockUserId' };
    next();
  }),
  authorize: jest.fn(() => (req, res, next) => next())
}));

jest.mock('../../middleware/checkGameStart', () => jest.fn((req, res, next) => next()));

const app = express();
app.use(express.json());
app.use('/api/v1/entries', protect, checkGameStart, entryRoutes);
app.use('/api/v1/pools/:poolId/entries', protect, checkGameStart, entryRoutes);
app.use(errorHandler);

describe('Entry Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/entries/user', () => {
    it('should get all entries for the current user', async () => {
      const mockEntries = [
        { _id: 'entry1', user: 'mockUserId', pool: 'pool1' },
        { _id: 'entry2', user: 'mockUserId', pool: 'pool2' }
      ];

      EntryService.getUserEntries.mockResolvedValue(mockEntries);

      const res = await request(app).get('/api/v1/entries/user');

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        success: true,
        count: 2,
        data: mockEntries
      });
      expect(EntryService.getUserEntries).toHaveBeenCalledWith('mockUserId');
    });
  });

  describe('GET /api/v1/entries/user/with-picks', () => {
    it('should get user entries with picks', async () => {
      const mockEntriesWithPicks = [
        { _id: 'entry1', user: 'mockUserId', pool: 'pool1', picks: [{ team: 'Patriots', week: 5 }] },
        { _id: 'entry2', user: 'mockUserId', pool: 'pool2', picks: [{ team: '49ers', week: 5 }] }
      ];

      EntryService.getUserEntriesWithPicks.mockResolvedValue(mockEntriesWithPicks);

      const res = await request(app).get('/api/v1/entries/user/with-picks');

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        success: true,
        count: 2,
        data: mockEntriesWithPicks
      });
      expect(EntryService.getUserEntriesWithPicks).toHaveBeenCalledWith('mockUserId', undefined);
    });

    it('should handle population query parameter', async () => {
      const mockEntriesWithPicks = [
        { _id: 'entry1', user: 'mockUserId', pool: 'pool1', picks: [{ team: 'Patriots', week: 5, game: { home_team: 'Patriots', away_team: 'Jets' } }] },
      ];

      EntryService.getUserEntriesWithPicks.mockResolvedValue(mockEntriesWithPicks);

      const res = await request(app).get('/api/v1/entries/user/with-picks?populate=picks.game');

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        success: true,
        count: 1,
        data: mockEntriesWithPicks
      });
      expect(EntryService.getUserEntriesWithPicks).toHaveBeenCalledWith('mockUserId', 'picks.game');
    });
  });

  describe('GET /api/v1/pools/:poolId/entries', () => {
    it('should get all entries for a pool', async () => {
      const mockPoolEntries = [
        { _id: 'entry1', user: { _id: 'user1', username: 'John' }, pool: 'pool1' },
        { _id: 'entry2', user: { _id: 'user2', username: 'Jane' }, pool: 'pool1' }
      ];

      EntryService.getEntriesForPool.mockResolvedValue(mockPoolEntries);

      const res = await request(app).get('/api/v1/pools/pool1/entries');

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        success: true,
        count: 2,
        data: mockPoolEntries
      });
      expect(EntryService.getEntriesForPool).toHaveBeenCalledWith('pool1');
    });

    it('should handle errors when getting entries for a pool', async () => {
      EntryService.getEntriesForPool.mockRejectedValue(new ErrorResponse('Pool not found', 404));

      const res = await request(app).get('/api/v1/pools/nonexistent/entries');

      expect(res.statusCode).toBe(404);
      expect(res.body).toEqual({
        success: false,
        error: 'Pool not found'
      });
    });
  });

  describe('GET /api/v1/entries/:id', () => {
    it('should get a single entry', async () => {
      const mockEntry = { _id: 'entry1', user: 'mockUserId', pool: 'pool1' };

      EntryService.getEntry.mockResolvedValue(mockEntry);

      const res = await request(app).get('/api/v1/entries/entry1');

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        success: true,
        data: mockEntry
      });
      expect(EntryService.getEntry).toHaveBeenCalledWith('entry1', 'mockUserId');
    });

    it('should handle errors when getting a single entry', async () => {
      EntryService.getEntry.mockRejectedValue(new ErrorResponse('Entry not found', 404));

      const res = await request(app).get('/api/v1/entries/nonexistent');

      expect(res.statusCode).toBe(404);
      expect(res.body).toEqual({
        success: false,
        error: 'Entry not found'
      });
    });
  });

  describe('GET /api/v1/entries/:entryId/:entryNumber/picks/:week', () => {
    it('should get a pick for a specific week', async () => {
      const mockPick = { _id: 'pick1', entry: 'entry1', team: 'Patriots', week: 5 };

      EntryService.getPickForWeek.mockResolvedValue(mockPick);

      const res = await request(app).get('/api/v1/entries/entry1/1/picks/5');

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        success: true,
        data: mockPick
      });
      expect(EntryService.getPickForWeek).toHaveBeenCalledWith('entry1', '1', '5');
    });

    it('should handle when no pick is found for a week', async () => {
      EntryService.getPickForWeek.mockResolvedValue(null);

      const res = await request(app).get('/api/v1/entries/entry1/1/picks/10');

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        success: true,
        data: null
      });
    });
  });

  describe('POST /api/v1/entries/:entryId/picks', () => {
    it('should add or update a pick for an entry', async () => {
      const mockPick = { _id: 'pick1', team: 'Patriots', week: 5 };
      EntryService.addOrUpdatePick.mockResolvedValue(mockPick);

      console.log('Sending request to add/update pick');
      const res = await request(app)
        .post('/api/v1/entries/entry1/picks')
        .send({ team: 'Patriots', week: 5 });

      console.log('Response status:', res.status);
      console.log('Response body:', res.body);

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        success: true,
        data: mockPick
      });
      expect(EntryService.addOrUpdatePick).toHaveBeenCalledWith('entry1', undefined, 'mockUserId', 'Patriots', 5);
    });

    it('should handle errors when adding or updating a pick', async () => {
      EntryService.addOrUpdatePick.mockRejectedValue(new Error('Failed to add pick'));

      const res = await request(app)
        .post('/api/v1/entries/entry1/picks')
        .send({ team: 'Patriots', week: 5 });

      expect(res.statusCode).toBe(500);
      expect(res.body).toEqual({
        success: false,
        error: 'Failed to add pick'
      });
    });
  });
});