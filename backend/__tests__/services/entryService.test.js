const mongoose = require('mongoose');
const EntryService = require('../../services/entryService');
const Pool = require('../../models/Pool');
const Entry = require('../../models/Entry');
const Pick = require('../../models/Pick');
const User = require('../../models/User');
const Game = require('../../models/Game');
const Request = require('../../models/Request');
const { connect, closeDatabase, clearDatabase } = require('../testSetup');
const { 
  createUser, 
  createPool, 
  createEntry, 
  createPick,
  createObjectId,
  createRequest,
  createGame
} = require('../mockDataFactory');

beforeAll(async () => await connect());
afterEach(async () => await clearDatabase());
afterAll(async () => await closeDatabase());

describe('EntryService', () => {
  describe('getUserEntries', () => {
    it('should return all entries for a user with populated pool information', async () => {
      const user = await User.create(createUser());
      const pool = await Pool.create(createPool(user._id));
      const request = await Request.create(createRequest(user._id, pool._id));
      await Entry.create(createEntry(user._id, pool._id, request._id));

      const entries = await EntryService.getUserEntries(user._id);

      expect(entries).toHaveLength(1);
      expect(entries[0].pool).toHaveProperty('name', pool.name);
      expect(entries[0].pool).toHaveProperty('currentWeek');
    });
  });

  describe('getUserEntriesForPool', () => {
    it('should return user entries for a specific pool', async () => {
      const user = await User.create(createUser());
      const pool1 = await Pool.create(createPool(user._id));
      const pool2 = await Pool.create(createPool(user._id));
      const request1 = await Request.create(createRequest(user._id, pool1._id));
      const request2 = await Request.create(createRequest(user._id, pool2._id));
      await Entry.create(createEntry(user._id, pool1._id, request1._id));
      await Entry.create(createEntry(user._id, pool2._id, request2._id));

      const entries = await EntryService.getUserEntriesForPool(user._id, pool1._id);

      expect(entries).toHaveLength(1);
      expect(entries[0].pool.toString()).toBe(pool1._id.toString());
    });
  });

  describe('getEntry', () => {
    it('should return a specific entry with populated pool and picks', async () => {
      const user = await User.create(createUser());
      const pool = await Pool.create(createPool(user._id));
      const request = await Request.create(createRequest(user._id, pool._id));
      const entry = await Entry.create(createEntry(user._id, pool._id, request._id));
      await Pick.create(createPick(entry._id));
  
      const retrievedEntry = await EntryService.getEntry(entry._id, user._id.toString());
  
      expect(retrievedEntry._id.toString()).toBe(entry._id.toString());
      expect(retrievedEntry.pool).toHaveProperty('name', pool.name);
      expect(retrievedEntry.picks).toHaveLength(1);
    });
  
    it('should throw an error if user is not authorized', async () => {
      const user1 = await User.create(createUser());
      const user2 = await User.create(createUser());
      const pool = await Pool.create(createPool(user1._id));
      const request = await Request.create(createRequest(user1._id, pool._id));
      const entry = await Entry.create(createEntry(user1._id, pool._id, request._id));
  
      await expect(EntryService.getEntry(entry._id, user2._id.toString()))
        .rejects.toThrow('User is not authorized to view this entry');
    });
  });

  describe('addOrUpdatePick', () => {
    it('should add a new pick for an entry', async () => {
      const user = await User.create(createUser());
      const pool = await Pool.create(createPool(user._id, { numberOfWeeks: 18 }));
      const request = await Request.create(createRequest(user._id, pool._id));
      const entry = await Entry.create(createEntry(user._id, pool._id, request._id));

      const pick = await EntryService.addOrUpdatePick(entry._id, user._id.toString(), 'Patriots', 5);

      expect(pick.team).toBe('Patriots');
      expect(pick.week).toBe(5);
      expect(pick.entry.toString()).toBe(entry._id.toString());
    });

    it('should update an existing pick', async () => {
      const user = await User.create(createUser());
      const pool = await Pool.create(createPool(user._id, { numberOfWeeks: 18 }));
      const request = await Request.create(createRequest(user._id, pool._id));
      const entry = await Entry.create(createEntry(user._id, pool._id, request._id));
      await Pick.create(createPick(entry._id, { week: 5, team: 'Patriots' }));

      const updatedPick = await EntryService.addOrUpdatePick(entry._id, user._id.toString(), '49ers', 5);

      expect(updatedPick.team).toBe('49ers');
      expect(updatedPick.week).toBe(5);
    });

    it('should throw an error if team is already picked for another week', async () => {
      const user = await User.create(createUser());
      const pool = await Pool.create(createPool(user._id, { numberOfWeeks: 18 }));
      const request = await Request.create(createRequest(user._id, pool._id));
      const entry = await Entry.create(createEntry(user._id, pool._id, request._id));
      await Pick.create(createPick(entry._id, { week: 1, team: 'Patriots' }));

      await expect(EntryService.addOrUpdatePick(entry._id, user._id.toString(), 'Patriots', 5))
        .rejects.toThrow('You already have a Patriots pick this season for this entry');
    });
  });

  describe('getPickForWeek', () => {
    it('should return a pick for a specific week', async () => {
      const user = await User.create(createUser());
      const pool = await Pool.create(createPool(user._id));
      const request = await Request.create(createRequest(user._id, pool._id));
      const entry = await Entry.create(createEntry(user._id, pool._id, request._id));
      const pick = await Pick.create(createPick(entry._id, { week: 5, team: 'Patriots' }));
  
      const retrievedPick = await EntryService.getPickForWeek(entry._id, 5);
  
      expect(retrievedPick._id.toString()).toBe(pick._id.toString());
      expect(retrievedPick.team).toBe('Patriots');
      expect(retrievedPick.week).toBe(5);
    });
  
    it('should return null if no pick is found for the week', async () => {
      const user = await User.create(createUser());
      const pool = await Pool.create(createPool(user._id));
      const request = await Request.create(createRequest(user._id, pool._id));
      const entry = await Entry.create(createEntry(user._id, pool._id, request._id));
  
      const retrievedPick = await EntryService.getPickForWeek(entry._id, 5);
  
      expect(retrievedPick).toBeNull();
    });
  });

  describe('eliminateEntry', () => {
    it('should eliminate an entry', async () => {
      const user = await User.create(createUser());
      const pool = await Pool.create(createPool(user._id));
      const request = await Request.create(createRequest(user._id, pool._id));
      const entry = await Entry.create(createEntry(user._id, pool._id, request._id));

      const eliminatedEntry = await EntryService.eliminateEntry(entry._id, 6);

      expect(eliminatedEntry.status).toBe('eliminated');
      expect(eliminatedEntry.eliminatedWeek).toBe(6);
    });
  });

  describe('getUserEntriesWithPicks', () => {
    it('should return user entries with populated picks', async () => {
      const user = await User.create(createUser());
      const pool = await Pool.create(createPool(user._id));
      const request = await Request.create(createRequest(user._id, pool._id));
      const entry = await Entry.create(createEntry(user._id, pool._id, request._id));
      await Pick.create(createPick(entry._id, { week: 1, team: 'Patriots' }));
      await Pick.create(createPick(entry._id, { week: 2, team: '49ers' }));

      const entriesWithPicks = await EntryService.getUserEntriesWithPicks(user._id);

      expect(entriesWithPicks).toHaveLength(1);
      expect(entriesWithPicks[0].picks).toHaveLength(2);
      expect(entriesWithPicks[0].pool).toHaveProperty('name', pool.name);
    });

    it('should populate game information when specified', async () => {
        const user = await User.create(createUser());
        const pool = await Pool.create(createPool(user._id));
        const request = await Request.create(createRequest(user._id, pool._id));
        const entry = await Entry.create(createEntry(user._id, pool._id, request._id));
        const game = await Game.create(createGame());
        await Pick.create(createPick(entry._id, { week: 1, team: 'Patriots', game: game._id }));
    
        const entriesWithPicks = await EntryService.getUserEntriesWithPicks(user._id, 'picks.game');
    
        expect(entriesWithPicks).toHaveLength(1);
        expect(entriesWithPicks[0].picks).toHaveLength(1);
        expect(entriesWithPicks[0].picks[0]).toHaveProperty('game');
        expect(entriesWithPicks[0].picks[0].game).toHaveProperty('away_team');
        expect(entriesWithPicks[0].picks[0].game).toHaveProperty('home_team');
      });
    });
});