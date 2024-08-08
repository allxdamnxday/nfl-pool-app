const mongoose = require('mongoose');
const Entry = require('../../models/Entry');
const User = require('../../models/User');
const Pool = require('../../models/Pool');
const Request = require('../../models/Request');
const Pick = require('../mockModels/Pick'); // Added this line
const { connect, closeDatabase, clearDatabase } = require('../testSetup');
const { createUser, createPool, createRequest, createEntry } = require('../mockDataFactory');

beforeAll(async () => await connect());
afterEach(async () => await clearDatabase());
afterAll(async () => await closeDatabase());

describe('Entry Model Test', () => {
  let user, pool, request;

  beforeEach(async () => {
    user = await User.create(createUser());
    pool = await Pool.create(createPool(user._id));
    request = await Request.create(createRequest(user._id, pool._id));
  });

  it('should create & save entry successfully', async () => {
    const validEntry = createEntry(user._id, pool._id, request._id);
    const savedEntry = await Entry.create(validEntry);

    expect(savedEntry._id).toBeDefined();
    expect(savedEntry.user.toString()).toBe(user._id.toString());
    expect(savedEntry.pool.toString()).toBe(pool._id.toString());
    expect(savedEntry.request.toString()).toBe(request._id.toString());
    expect(savedEntry.entryNumber).toBe(validEntry.entryNumber);
    expect(savedEntry.status).toBe('active');
    expect(savedEntry.eliminatedWeek).toBeNull();
  });

  it('should fail to create entry without required fields', async () => {
    const invalidEntry = {};
    await expect(Entry.create(invalidEntry)).rejects.toThrow(mongoose.Error.ValidationError);
  });

  it('should fail to create entry with invalid entryNumber', async () => {
    const invalidEntry = createEntry(user._id, pool._id, request._id, { entryNumber: 4 });
    await expect(Entry.create(invalidEntry)).rejects.toThrow(mongoose.Error.ValidationError);
  });

  it('should fail to create entry with invalid status', async () => {
    const invalidEntry = createEntry(user._id, pool._id, request._id, { status: 'invalid_status' });
    await expect(Entry.create(invalidEntry)).rejects.toThrow(mongoose.Error.ValidationError);
  });

  it('should fail to create duplicate entry for same user, pool, and entryNumber', async () => {
    const validEntry = createEntry(user._id, pool._id, request._id);
    await Entry.create(validEntry);
    await expect(Entry.create(validEntry)).rejects.toThrow(/duplicate key error/);
  });

  it('should update entry status successfully', async () => {
    const entry = await Entry.create(createEntry(user._id, pool._id, request._id));
    entry.status = 'eliminated';
    entry.eliminatedWeek = 5;
    const updatedEntry = await entry.save();

    expect(updatedEntry.status).toBe('eliminated');
    expect(updatedEntry.eliminatedWeek).toBe(5);
  });

  it('should populate virtual picks field', async () => {
    const entry = await Entry.create(createEntry(user._id, pool._id, request._id));
    await Pick.create({ entry: entry._id, user: user._id, pool: pool._id, team: 'Test Team' });

    const populatedEntry = await Entry.findById(entry._id).populate('picks');
    expect(populatedEntry.picks).toBeDefined();
    expect(populatedEntry.picks.length).toBe(1);
    expect(populatedEntry.picks[0].team).toBe('Test Team');
  });

  it('should delete entry successfully', async () => {
    const entry = await Entry.create(createEntry(user._id, pool._id, request._id));
    await Entry.findByIdAndDelete(entry._id);
    const deletedEntry = await Entry.findById(entry._id);
    expect(deletedEntry).toBeNull();
  });
});