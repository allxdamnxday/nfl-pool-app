const mongoose = require('mongoose');
const Pool = require('../../models/Pool');
const User = require('../../models/User');
const Pick = require('../mockModels/Pick');
const Entry = require('../mockModels/Entry');
const Request = require('../mockModels/Request');
const { connect, closeDatabase, clearDatabase } = require('../testSetup');
const { createUser, createPool, createRequest } = require('../mockDataFactory');

beforeAll(async () => await connect());
afterEach(async () => await clearDatabase());
afterAll(async () => await closeDatabase());

describe('Pool Model Test', () => {
  it('should create & save pool successfully', async () => {
    const user = await User.create(createUser());
    const validPool = createPool(user._id);
    const savedPool = await Pool.create(validPool);

    expect(savedPool._id).toBeDefined();
    expect(savedPool.name).toBe(validPool.name);
    expect(savedPool.season).toBe(validPool.season);
    expect(savedPool.status).toBe('pending');
    expect(savedPool.maxParticipants).toBe(validPool.maxParticipants);
    expect(savedPool.entryFee).toBe(validPool.entryFee);
    expect(savedPool.prizeAmount).toBe(validPool.prizeAmount);
    expect(savedPool.creator.toString()).toBe(user._id.toString());
    expect(savedPool.description).toBe(validPool.description);
    expect(savedPool.startDate).toEqual(validPool.startDate);
    expect(savedPool.endDate).toEqual(validPool.endDate);
    expect(savedPool.maxEntries).toBe(validPool.maxEntries);
    expect(savedPool.prizePot).toBe(validPool.prizePot);
  });

  it('should fail to create pool without required fields', async () => {
    const invalidPool = {};
    await expect(Pool.create(invalidPool)).rejects.toThrow(mongoose.Error.ValidationError);
  });

  it('should fail to create pool with invalid season year', async () => {
    const user = await User.create(createUser());
    const invalidPool = createPool(user._id, { season: 2019 });
    await expect(Pool.create(invalidPool)).rejects.toThrow(mongoose.Error.ValidationError);
  });

  it('should fail to create pool with invalid status', async () => {
    const user = await User.create(createUser());
    const invalidPool = createPool(user._id, { status: 'invalid_status' });
    await expect(Pool.create(invalidPool)).rejects.toThrow(mongoose.Error.ValidationError);
  });

  it('should fail to create pool with invalid maxParticipants', async () => {
    const user = await User.create(createUser());
    const invalidPool = createPool(user._id, { maxParticipants: 1 });
    await expect(Pool.create(invalidPool)).rejects.toThrow(mongoose.Error.ValidationError);
  });

  it('should update currentWeek successfully', async () => {
    const user = await User.create(createUser());
    const pool = await Pool.create(createPool(user._id));
    
    pool.currentWeek = 2;
    const updatedPool = await pool.save();
    
    expect(updatedPool.currentWeek).toBe(2);
  });

  it('should populate virtual fields', async () => {
    const user = await User.create(createUser());
    const pool = await Pool.create(createPool(user._id));
    
    // Create a Request first
    const request = await Request.create(createRequest(user._id, pool._id));
    
    // Create an Entry with the request
    const entry = await Entry.create({ user: user._id, pool: pool._id, request: request._id, entryNumber: 1 });
    
    // Create test data for virtual fields
    await Pick.create({ pool: pool._id, user: user._id, team: 'Test Team', entry: entry._id });
    await Entry.create({ user: user._id, pool: pool._id, request: request._id, entryNumber: 2 });
    await Request.create({ pool: pool._id, user: user._id });
    
    const populatedPool = await Pool.findById(pool._id)
      .populate('picks')
      .populate('entries')
      .populate('requests');
    
    expect(populatedPool.picks).toBeDefined();
    expect(populatedPool.picks.length).toBe(1);
    expect(populatedPool.entries).toBeDefined();
    expect(populatedPool.entries.length).toBe(2);
    expect(populatedPool.requests).toBeDefined();
    expect(populatedPool.requests.length).toBe(2);
  });

  // Add more tests here for other validations and custom methods if any
});