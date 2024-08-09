const mongoose = require('mongoose');
const PickService = require('../../services/pickService');
const Pick = require('../../models/Pick');
const Entry = require('../../models/Entry');
const Game = require('../../models/Game');
const User = require('../../models/User');
const Pool = require('../../models/Pool');
const Request = require('../../models/Request');
const { connect, closeDatabase, clearDatabase } = require('../testSetup');
const { 
  createUser, 
  createPool, 
  createEntry, 
  createPick,
  createGame,
  createRequest,
  createObjectId
} = require('../mockDataFactory');

beforeAll(async () => await connect());
afterEach(async () => await clearDatabase());
afterAll(async () => await closeDatabase());

describe('PickService', () => {
  describe('addOrUpdatePick', () => {
    it('should add a new pick for an entry', async () => {
      const user = await User.create(createUser());
      const pool = await Pool.create(createPool(user._id, { numberOfWeeks: 18 }));
      const request = await Request.create(createRequest(user._id, pool._id));
      const entry = await Entry.create(createEntry(user._id, pool._id, request._id));
      const game = await Game.create(createGame({ 
        schedule: { week: 5 },
        teams_normalized: [
          { name: 'Patriots', is_away: true, is_home: false },
          { name: '49ers', is_away: false, is_home: true }
        ],
        event_date: new Date(Date.now() + 86400000) // 1 day in the future
      }));

      const pick = await PickService.addOrUpdatePick(entry._id, entry.entryNumber, user._id.toString(), 'Patriots', 5);

      expect(pick.team).toBe('Patriots');
      expect(pick.week).toBe(5);
      expect(pick.entry.toString()).toBe(entry._id.toString());
    });

    it('should throw an error if user is not authorized', async () => {
      const user1 = await User.create(createUser());
      const user2 = await User.create(createUser());
      const pool = await Pool.create(createPool(user1._id, { numberOfWeeks: 18 }));
      const request = await Request.create(createRequest(user1._id, pool._id));
      const entry = await Entry.create(createEntry(user1._id, pool._id, request._id));
      await Game.create(createGame({ 
        schedule: { week: 5 },
        teams_normalized: [
          { name: 'Patriots', is_away: true, is_home: false },
          { name: '49ers', is_away: false, is_home: true }
        ],
        event_date: new Date(Date.now() + 86400000)
      }));

      await expect(PickService.addOrUpdatePick(entry._id, entry.entryNumber, user2._id.toString(), 'Patriots', 5))
        .rejects.toThrow('User is not authorized to update this entry');
    });

    it('should throw an error if team is already picked for another week', async () => {
      const user = await User.create(createUser());
      const pool = await Pool.create(createPool(user._id, { numberOfWeeks: 18 }));
      const request = await Request.create(createRequest(user._id, pool._id));
      const entry = await Entry.create(createEntry(user._id, pool._id, request._id));
      await Game.create(createGame({ 
        schedule: { week: 5 },
        teams_normalized: [
          { name: 'Patriots', is_away: true, is_home: false },
          { name: '49ers', is_away: false, is_home: true }
        ],
        event_date: new Date(Date.now() + 86400000)
      }));
      await Game.create(createGame({ 
        schedule: { week: 6 },
        teams_normalized: [
          { name: 'Patriots', is_away: true, is_home: false },
          { name: 'Jets', is_away: false, is_home: true }
        ],
        event_date: new Date(Date.now() + 172800000) // 2 days in the future
      }));
      await Pick.create(createPick(entry._id, { week: 5, team: 'Patriots' }));

      await expect(PickService.addOrUpdatePick(entry._id, entry.entryNumber, user._id.toString(), 'Patriots', 6))
        .rejects.toThrow('You already have a Patriots pick this season for this entry');
    });

    it('should throw an error if trying to pick a game after it has started', async () => {
      const user = await User.create(createUser());
      const pool = await Pool.create(createPool(user._id, { numberOfWeeks: 18 }));
      const request = await Request.create(createRequest(user._id, pool._id));
      const entry = await Entry.create(createEntry(user._id, pool._id, request._id));
      await Game.create(createGame({ 
        schedule: { week: 5 },
        teams_normalized: [
          { name: 'Patriots', is_away: true, is_home: false },
          { name: '49ers', is_away: false, is_home: true }
        ],
        event_date: new Date(Date.now() - 3600000) // 1 hour in the past
      }));

      await expect(PickService.addOrUpdatePick(entry._id, entry.entryNumber, user._id.toString(), 'Patriots', 5))
        .rejects.toThrow('Cannot update pick after game has started');
    });
  });

  describe('getPicksForWeek', () => {
    it('should return picks for a specific week', async () => {
      const user = await User.create(createUser());
      const pool = await Pool.create(createPool(user._id));
      const request = await Request.create(createRequest(user._id, pool._id));
      const entry = await Entry.create(createEntry(user._id, pool._id, request._id));
      const pick = await Pick.create(createPick(entry._id, { week: 5, team: 'Patriots' }));

      const picks = await PickService.getPicksForWeek(entry._id, entry.entryNumber, 5);

      expect(picks).toHaveLength(1);
      expect(picks[0].team).toBe('Patriots');
      expect(picks[0].week).toBe(5);
    });
  });

  describe('getPicksForEntry', () => {
    it('should return all picks for an entry', async () => {
      const user = await User.create(createUser());
      const pool = await Pool.create(createPool(user._id));
      const request = await Request.create(createRequest(user._id, pool._id));
      const entry = await Entry.create(createEntry(user._id, pool._id, request._id));
      await Pick.create(createPick(entry._id, { week: 5, team: 'Patriots' }));
      await Pick.create(createPick(entry._id, { week: 6, team: '49ers' }));

      const picks = await PickService.getPicksForEntry(entry._id);

      expect(picks).toHaveLength(2);
      expect(picks[0].team).toBe('Patriots');
      expect(picks[1].team).toBe('49ers');
    });
  });
});