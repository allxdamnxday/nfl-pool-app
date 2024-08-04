const mongoose = require('mongoose');
const entryService = require('../../services/entryService');
const Entry = require('../../models/Entry');
const Pool = require('../../models/Pool');

describe('Entry Service', () => {
  describe('getUserEntries', () => {
    it('should return all entries for a user', async () => {
      const userId = new mongoose.Types.ObjectId();
      const pool1 = await Pool.create({ name: 'Pool 1' });
      const pool2 = await Pool.create({ name: 'Pool 2' });
      await Entry.create({ user: userId, pool: pool1._id, entryNumber: 1 });
      await Entry.create({ user: userId, pool: pool2._id, entryNumber: 1 });

      const entries = await entryService.getUserEntries(userId);

      expect(entries).toHaveLength(2);
      expect(entries[0].pool.name).toBe('Pool 1');
      expect(entries[1].pool.name).toBe('Pool 2');
    });
  });

  describe('getEntry', () => {
    it('should return a specific entry for a user', async () => {
      const userId = new mongoose.Types.ObjectId();
      const pool = await Pool.create({ name: 'Test Pool' });
      const entry = await Entry.create({ user: userId, pool: pool._id, entryNumber: 1 });

      const retrievedEntry = await entryService.getEntry(entry._id, userId);

      expect(retrievedEntry._id.toString()).toBe(entry._id.toString());
      expect(retrievedEntry.pool.name).toBe('Test Pool');
    });

    it('should throw an error if entry is not found or unauthorized', async () => {
      const userId = new mongoose.Types.ObjectId();
      const wrongUserId = new mongoose.Types.ObjectId();
      const pool = await Pool.create({ name: 'Test Pool' });
      const entry = await Entry.create({ user: userId, pool: pool._id, entryNumber: 1 });

      await expect(entryService.getEntry(entry._id, wrongUserId)).rejects.toThrow('Entry not found or unauthorized');
    });
  });
});