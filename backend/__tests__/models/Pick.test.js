const mongoose = require('mongoose');
const Pick = require('../../models/Pick');
const { connect, closeDatabase, clearDatabase } = require('../testSetup');
const { createTestUser, createTestPool, createTestEntry, createTestPick, createTestRequest } = require('../testUtils');

beforeAll(async () => await connect());
afterEach(async () => await clearDatabase());
afterAll(async () => await closeDatabase());

describe('Pick Model Test', () => {
  let user, pool, entry, request;

  beforeEach(async () => {
    user = await createTestUser();
    console.log('Created User:', JSON.stringify(user, null, 2));
    pool = await createTestPool(user._id);
    request = await createTestRequest(user._id, pool._id);
    entry = await createTestEntry(user._id, pool._id, request._id);
  });

  it('should create & save pick successfully', async () => {
    console.log('Before creating pick - Entry:', entry);
    const validPick = await createTestPick(entry._id, { week: 1, entryNumber: 1, team: 'Patriots' });
    console.log('Created Pick:', JSON.stringify(validPick, null, 2));
    console.log('Entry ID:', entry._id);
    expect(validPick._id).toBeDefined();
    expect(validPick.entry).toBeDefined();
    expect(validPick.entry.toString()).toBe(entry._id.toString());
    expect(validPick.team).toBe('Patriots');
    expect(validPick.week).toBe(1);
    expect(validPick.entryNumber).toBe(1);
    expect(validPick.result).toBe('pending');
  });

  it('should fail to create pick without required fields', async () => {
    const invalidPick = new Pick({});
    await expect(invalidPick.save()).rejects.toThrow(mongoose.Error.ValidationError);
  });

  it('should fail to create pick with invalid entryNumber', async () => {
    const invalidPick = new Pick({
      entry: entry._id,
      entryNumber: 4,
      week: 1,
      team: 'Patriots'
    });
    await expect(invalidPick.save()).rejects.toThrow(mongoose.Error.ValidationError);
  });

  it('should fail to create pick with invalid week', async () => {
    const invalidPick = new Pick({
      entry: entry._id,
      entryNumber: 1,
      week: 19,
      team: 'Patriots'
    });
    await expect(invalidPick.save()).rejects.toThrow(mongoose.Error.ValidationError);
  });

  it('should fail to create duplicate pick for same entry, entryNumber, and week', async () => {
    const pick1 = await createTestPick(entry._id, { week: 1, entryNumber: 1 });
    const pick2 = new Pick({
      entry: entry._id,
      entryNumber: pick1.entryNumber,
      week: pick1.week,
      team: 'Dolphins'
    });
    await expect(pick2.save()).rejects.toThrow(/duplicate key error/);
  });

  it('should update pick successfully', async () => {
    const pick = await createTestPick(entry._id, user._id, pool._id);
    pick.result = 'win';
    const updatedPick = await pick.save();
    expect(updatedPick.result).toBe('win');
  });

  it('should delete pick successfully', async () => {
    const pick = await createTestPick(entry._id, user._id, pool._id);
    await Pick.findByIdAndDelete(pick._id);
    const deletedPick = await Pick.findById(pick._id);
    expect(deletedPick).toBeNull();
  });

  it('should find picks by entry', async () => {
    await createTestPick(entry._id, { week: 1, entryNumber: 1 });
    await createTestPick(entry._id, { week: 1, entryNumber: 2 });
    const picks = await Pick.find({ entry: entry._id });
    expect(picks.length).toBe(2);
  });

  it('should validate result enum', async () => {
    const pick = await createTestPick(entry._id, user._id, pool._id);
    pick.result = 'invalid';
    await expect(pick.save()).rejects.toThrow(mongoose.Error.ValidationError);
  });
});