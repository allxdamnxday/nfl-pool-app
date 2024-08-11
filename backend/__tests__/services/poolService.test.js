// __tests__/services/poolService.test.js

const mongoose = require('mongoose');
const PoolService = require('../../services/poolService');
const Pool = require('../../models/Pool');
const Request = require('../../models/Request');
const Entry = require('../../models/Entry');
const User = require('../../models/User');
const ErrorResponse = require('../../utils/errorResponse');
const { connect, closeDatabase, clearDatabase } = require('../testSetup');
const { 
  createUser, 
  createAdmin, 
  createRequest, 
  createPool, 
  createEntry, 
  createPick, 
  createGame,
  createObjectId
} = require('../mockDataFactory');

describe('PoolService', () => {
  beforeAll(async () => await connect());
  afterEach(async () => await clearDatabase());
  afterAll(async () => await closeDatabase());

  describe('getAvailablePools', () => {
    it('should return available pools with user-specific information', async () => {
      const user = await User.create(createUser());
      const pool1 = await Pool.create(createPool(user._id, { status: 'open' }));
      const pool2 = await Pool.create(createPool(user._id, { status: 'open' }));
      await Request.create(createRequest(user._id, pool1._id));
      await Entry.create(createEntry(user._id, pool2._id, createObjectId()));

      const availablePools = await PoolService.getAvailablePools(user._id);

      expect(availablePools).toHaveLength(2);
      expect(availablePools[0].userRequests).toBe(1);
      expect(availablePools[0].userEntries).toBe(0);
      expect(availablePools[1].userRequests).toBe(0);
      expect(availablePools[1].userEntries).toBe(1);
    });

    it('should only return open pools', async () => {
      const user = await User.create(createUser());
      await Pool.create(createPool(user._id, { status: 'open' }));
      await Pool.create(createPool(user._id, { status: 'active' }));

      const availablePools = await PoolService.getAvailablePools(user._id);

      expect(availablePools).toHaveLength(1);
      expect(availablePools[0].status).toBe('open');
    });
  });

  describe('createPool', () => {
    it('should create a new pool', async () => {
      const user = await User.create(createUser());
      const poolData = createPool(user._id);
  
      const newPool = await PoolService.createPool(user._id, poolData);
  
      expect(newPool.name).toBe(poolData.name);
      expect(newPool.entryFee).toBe(poolData.entryFee);
      expect(newPool.numberOfWeeks).toBe(poolData.numberOfWeeks);
      expect(newPool.creator.toString()).toBe(user._id.toString());
      expect(newPool.status).toBe('open');
      expect(newPool.season).toBe(poolData.season);
    });
  
    it('should throw an error if required fields are missing', async () => {
      const user = await User.create(createUser());
      const invalidPoolData = { name: 'Invalid Pool' };
  
      await expect(PoolService.createPool(user._id, invalidPoolData))
        .rejects.toThrow(/Please add season, maxParticipants, entryFee, prizeAmount, description, startDate, endDate, maxEntries, prizePot, numberOfWeeks/);
    });
  
    it('should throw an error if invalid data is provided', async () => {
      const user = await User.create(createUser());
      const invalidPoolData = createPool(user._id, {
        numberOfWeeks: 20, // Invalid: more than 18 weeks
      });
  
      await expect(PoolService.createPool(user._id, invalidPoolData))
        .rejects.toThrow('Number of weeks must be between 1 and 18');
    });
  });

  describe('updatePool', () => {
    it('should update a pool', async () => {
      const user = await User.create(createUser());
      const pool = await Pool.create(createPool(user._id));
      const updateData = { name: 'Updated Pool Name' };
    
      const updatedPool = await PoolService.updatePool(pool._id, user._id.toString(), updateData);
    
      expect(updatedPool.name).toBe(updateData.name);
    });

    it('should throw an error if user is not authorized to update', async () => {
      const user1 = await User.create(createUser());
      const user2 = await User.create(createUser());
      const pool = await Pool.create(createPool(user1._id));
    
      await expect(PoolService.updatePool(pool._id, user2._id, { name: 'Unauthorized Update' }))
        .rejects.toThrow(`User ${user2._id} is not authorized to update this pool`);
    });
  });

  describe('deletePool', () => {
    it('should delete a pool', async () => {
      const user = await User.create(createUser());
      const pool = await Pool.create(createPool(user._id));

      await PoolService.deletePool(pool._id, user._id);

      const deletedPool = await Pool.findById(pool._id);
      expect(deletedPool).toBeNull();
    });

    it('should throw an error if user is not authorized to delete', async () => {
      const user1 = await User.create(createUser());
      const user2 = await User.create(createUser());
      const pool = await Pool.create(createPool(user1._id));
    
      await expect(PoolService.deletePool(pool._id, user2._id))
        .rejects.toThrow(`User ${user2._id} is not authorized to delete this pool`);
    });
  });

  describe('getPoolStats', () => {
    it('should return correct pool statistics', async () => {
      const user = await User.create(createUser());
      const pool = await Pool.create(createPool(user._id, {
        participants: [user._id],
        eliminatedUsers: [],
        currentWeek: 5
      }));

      const stats = await PoolService.getPoolStats(pool._id);

      expect(stats.totalParticipants).toBe(1);
      expect(stats.eliminatedParticipants).toBe(0);
      expect(stats.currentWeek).toBe(5);
    });
  });

  describe('updatePoolStatus', () => {
    it('should update pool status', async () => {
      const user = await User.create(createUser());
      const pool = await Pool.create(createPool(user._id, { status: 'open' }));

      const updatedPool = await PoolService.updatePoolStatus(pool._id, 'active');

      expect(updatedPool.status).toBe('active');
    });

    it('should throw an error for invalid status', async () => {
      const user = await User.create(createUser());
      const pool = await Pool.create(createPool(user._id));

      await expect(PoolService.updatePoolStatus(pool._id, 'invalid'))
        .rejects.toThrow('Invalid status. Must be open, active, or completed.');
    });
  });

  describe('getUserPoolsWithEntries', () => {
    it('should return pools with entries and creator information for a user', async () => {
      const user = await User.create(createUser());
      const otherUser = await User.create(createUser());
      const pool1 = await Pool.create(createPool(user._id));
      const pool2 = await Pool.create(createPool(otherUser._id));
      const entry1 = await Entry.create(createEntry(user._id, pool1._id, createObjectId(), { status: 'active' }));
      const entry2 = await Entry.create(createEntry(user._id, pool2._id, createObjectId(), { status: 'eliminated' }));

      const poolsWithEntries = await PoolService.getUserPoolsWithEntries(user._id.toString());

      expect(poolsWithEntries).toHaveLength(2);
      
      // Check pool1 (user is creator)
      expect(poolsWithEntries[0]._id.toString()).toBe(pool1._id.toString());
      expect(poolsWithEntries[0].isCreator).toBe(true);
      expect(poolsWithEntries[0].activeEntries).toBe(1);
      expect(poolsWithEntries[0].entries).toHaveLength(1);
      expect(poolsWithEntries[0].entries[0]._id.toString()).toBe(entry1._id.toString());

      // Check pool2 (user is not creator)
      expect(poolsWithEntries[1]._id.toString()).toBe(pool2._id.toString());
      expect(poolsWithEntries[1].isCreator).toBe(false);
      expect(poolsWithEntries[1].activeEntries).toBe(0);
      expect(poolsWithEntries[1].entries).toHaveLength(1);
      expect(poolsWithEntries[1].entries[0]._id.toString()).toBe(entry2._id.toString());
    });

    it('should only return pools where the user has entries', async () => {
      const user = await User.create(createUser());
      const pool1 = await Pool.create(createPool(user._id));
      const pool2 = await Pool.create(createPool(user._id));
      await Entry.create(createEntry(user._id, pool1._id, createObjectId(), { status: 'active' }));
      // No entry created for pool2

      const poolsWithEntries = await PoolService.getUserPoolsWithEntries(user._id.toString());

      expect(poolsWithEntries).toHaveLength(1);
      expect(poolsWithEntries[0]._id.toString()).toBe(pool1._id.toString());
    });

    it('should handle a user with no entries', async () => {
      const user = await User.create(createUser());
      await Pool.create(createPool(user._id)); // Create a pool but no entries

      const poolsWithEntries = await PoolService.getUserPoolsWithEntries(user._id.toString());

      expect(poolsWithEntries).toHaveLength(0);
    });
  });

  describe('getPoolEntries', () => {
    it('should return all entries for a pool', async () => {
      const user1 = await User.create(createUser());
      const user2 = await User.create(createUser());
      const pool = await Pool.create(createPool(user1._id));
      await Entry.create(createEntry(user1._id, pool._id, createObjectId()));
      await Entry.create(createEntry(user2._id, pool._id, createObjectId()));

      const entries = await PoolService.getPoolEntries(pool._id);

      expect(entries).toHaveLength(2);
      expect(entries[0].pool.toString()).toBe(pool._id.toString());
      expect(entries[1].pool.toString()).toBe(pool._id.toString());
    });
  });
});