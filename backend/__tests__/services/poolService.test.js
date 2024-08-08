// __tests__/services/poolService.test.js

const mongoose = require('mongoose');
const PoolService = require('../../services/poolService');
const Pool = require('../../models/Pool');
const Request = require('../../models/Request');
const Entry = require('../../models/Entry');
const User = require('../../models/User');
const ErrorResponse = require('../../utils/errorResponse');
const { connect, closeDatabase, clearDatabase } = require('../testSetup');
const { createTestUser, createTestPool, createTestRequest, createTestEntry } = require('../testUtils');

describe('PoolService', () => {
  beforeAll(async () => await connect());
  afterEach(async () => await clearDatabase());
  afterAll(async () => await closeDatabase());

  describe('getAvailablePools', () => {
    it('should return available pools with user-specific information', async () => {
      const user = await createTestUser();
      const pool1 = await createTestPool(user._id, { status: 'open' });
      const pool2 = await createTestPool(user._id, { status: 'open' });
      await createTestRequest(user._id, pool1._id);
      await createTestEntry(user._id, pool2._id, new mongoose.Types.ObjectId());

      const availablePools = await PoolService.getAvailablePools(user._id);

      expect(availablePools).toHaveLength(2);
      expect(availablePools[0].userRequests).toBe(1);
      expect(availablePools[0].userEntries).toBe(0);
      expect(availablePools[1].userRequests).toBe(0);
      expect(availablePools[1].userEntries).toBe(1);
    });

    it('should only return open pools', async () => {
      const user = await createTestUser();
      await createTestPool(user._id, { status: 'open' });
      await createTestPool(user._id, { status: 'active' });

      const availablePools = await PoolService.getAvailablePools(user._id);

      expect(availablePools).toHaveLength(1);
      expect(availablePools[0].status).toBe('open');
    });
  });

  describe('createPool', () => {
    it('should create a new pool', async () => {
      const user = await createTestUser();
      const poolData = {
        name: 'Test Pool',
        entryFee: 50,
        numberOfWeeks: 17
      };

      const newPool = await PoolService.createPool(user._id, poolData);

      expect(newPool.name).toBe(poolData.name);
      expect(newPool.entryFee).toBe(poolData.entryFee);
      expect(newPool.numberOfWeeks).toBe(poolData.numberOfWeeks);
      expect(newPool.creator.toString()).toBe(user._id.toString());
    });

    it('should throw an error if required fields are missing', async () => {
      const user = await createTestUser();
      const invalidPoolData = { name: 'Invalid Pool' };

      await expect(PoolService.createPool(user._id, invalidPoolData))
        .rejects.toThrow(ErrorResponse);
    });
  });

  describe('updatePool', () => {
    it('should update a pool', async () => {
      const user = await createTestUser();
      const pool = await createTestPool(user._id);
      const updateData = { name: 'Updated Pool Name' };

      const updatedPool = await PoolService.updatePool(pool._id, user._id, updateData);

      expect(updatedPool.name).toBe(updateData.name);
    });

    it('should throw an error if user is not authorized', async () => {
      const user1 = await createTestUser();
      const user2 = await createTestUser();
      const pool = await createTestPool(user1._id);

      await expect(PoolService.updatePool(pool._id, user2._id, { name: 'Unauthorized Update' }))
        .rejects.toThrow('User is not authorized to update this pool');
    });
  });

  describe('deletePool', () => {
    it('should delete a pool', async () => {
      const user = await createTestUser();
      const pool = await createTestPool(user._id);

      await PoolService.deletePool(pool._id, user._id);

      const deletedPool = await Pool.findById(pool._id);
      expect(deletedPool).toBeNull();
    });

    it('should throw an error if user is not authorized', async () => {
      const user1 = await createTestUser();
      const user2 = await createTestUser();
      const pool = await createTestPool(user1._id);

      await expect(PoolService.deletePool(pool._id, user2._id))
        .rejects.toThrow('User is not authorized to delete this pool');
    });
  });

  describe('getPoolStats', () => {
    it('should return correct pool statistics', async () => {
      const user = await createTestUser();
      const pool = await createTestPool(user._id, {
        participants: [user._id],
        eliminatedUsers: [],
        currentWeek: 5
      });

      const stats = await PoolService.getPoolStats(pool._id);

      expect(stats.totalParticipants).toBe(1);
      expect(stats.eliminatedParticipants).toBe(0);
      expect(stats.currentWeek).toBe(5);
    });
  });

  describe('updatePoolStatus', () => {
    it('should update pool status', async () => {
      const user = await createTestUser();
      const pool = await createTestPool(user._id, { status: 'open' });

      const updatedPool = await PoolService.updatePoolStatus(pool._id, 'active');

      expect(updatedPool.status).toBe('active');
    });

    it('should throw an error for invalid status', async () => {
      const user = await createTestUser();
      const pool = await createTestPool(user._id);

      await expect(PoolService.updatePoolStatus(pool._id, 'invalid'))
        .rejects.toThrow('Invalid status. Must be open, active, or completed.');
    });
  });

  describe('getUserPools', () => {
    it('should return pools for a user with active entry count', async () => {
      const user = await createTestUser();
      const pool1 = await createTestPool(user._id);
      const pool2 = await createTestPool(user._id);
      await createTestEntry(user._id, pool1._id, new mongoose.Types.ObjectId(), { isActive: true });
      await createTestEntry(user._id, pool2._id, new mongoose.Types.ObjectId(), { isActive: false });

      const userPools = await PoolService.getUserPools(user._id);

      expect(userPools).toHaveLength(2);
      expect(userPools[0].activeEntries).toBe(1);
      expect(userPools[1].activeEntries).toBe(0);
    });
  });

  describe('getUserPoolsWithEntries', () => {
    it('should return pools with active entries for a user', async () => {
      const user = await createTestUser();
      const pool1 = await createTestPool(user._id);
      const pool2 = await createTestPool(user._id);
      const entry1 = await createTestEntry(user._id, pool1._id, new mongoose.Types.ObjectId(), { isActive: true });
      await createTestEntry(user._id, pool2._id, new mongoose.Types.ObjectId(), { isActive: false });

      const poolsWithEntries = await PoolService.getUserPoolsWithEntries(user._id);

      expect(poolsWithEntries).toHaveLength(2);
      expect(poolsWithEntries[0].activeEntries).toBe(1);
      expect(poolsWithEntries[0].userEntryId.toString()).toBe(entry1._id.toString());
      expect(poolsWithEntries[1].activeEntries).toBe(0);
      expect(poolsWithEntries[1].userEntryId).toBeUndefined();
    });
  });

  describe('getUserActivePools', () => {
    it('should return only active pools for a user', async () => {
      const user = await createTestUser();
      const pool1 = await createTestPool(user._id);
      const pool2 = await createTestPool(user._id);
      await createTestEntry(user._id, pool1._id, new mongoose.Types.ObjectId(), { isActive: true });
      await createTestEntry(user._id, pool2._id, new mongoose.Types.ObjectId(), { isActive: false });

      const activePools = await PoolService.getUserActivePools(user._id);

      expect(activePools).toHaveLength(1);
      expect(activePools[0]._id.toString()).toBe(pool1._id.toString());
    });
  });

  describe('getPoolEntries', () => {
    it('should return all entries for a pool', async () => {
      const user1