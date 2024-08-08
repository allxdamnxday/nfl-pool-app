const mongoose = require('mongoose');
const Request = require('../../models/Request');
const User = require('../../models/User');
const Pool = require('../../models/Pool');
const { connect, closeDatabase, clearDatabase } = require('../testSetup');
const { createUser, createPool, createRequest } = require('../mockDataFactory');

beforeAll(async () => await connect());
afterEach(async () => await clearDatabase());
afterAll(async () => await closeDatabase());

describe('Request Model Test', () => {
  it('should create & save request successfully', async () => {
    const user = await User.create(createUser());
    const pool = await Pool.create(createPool(user._id));
    const validRequest = createRequest(user._id, pool._id);
    const savedRequest = await Request.create(validRequest);

    expect(savedRequest._id).toBeDefined();
    expect(savedRequest.user.toString()).toBe(user._id.toString());
    expect(savedRequest.pool.toString()).toBe(pool._id.toString());
    expect(savedRequest.numberOfEntries).toBe(validRequest.numberOfEntries);
    expect(savedRequest.status).toBe('pending');
    expect(savedRequest.totalAmount).toBe(validRequest.totalAmount);
    expect(savedRequest.paymentStatus).toBe('pending');

    // Log the entire savedRequest for debugging
    console.log('Saved Request:', JSON.stringify(savedRequest, null, 2));
  });

  it('should fail to create request without required fields', async () => {
    const invalidRequest = {};
    await expect(Request.create(invalidRequest)).rejects.toThrow(mongoose.Error.ValidationError);
  });

  it('should fail to create request with invalid numberOfEntries', async () => {
    const user = await User.create(createUser());
    const pool = await Pool.create(createPool(user._id));
    const invalidRequest = createRequest(user._id, pool._id, { numberOfEntries: 5 });
    await expect(Request.create(invalidRequest)).rejects.toThrow(mongoose.Error.ValidationError);
  });

  it('should fail to create request with invalid status', async () => {
    const user = await User.create(createUser());
    const pool = await Pool.create(createPool(user._id));
    const invalidRequest = createRequest(user._id, pool._id, { status: 'invalid_status' });
    await expect(Request.create(invalidRequest)).rejects.toThrow(mongoose.Error.ValidationError);
  });

  it('should fail to create request with invalid paymentStatus', async () => {
    const user = await User.create(createUser());
    const pool = await Pool.create(createPool(user._id));
    const invalidRequest = createRequest(user._id, pool._id, { paymentStatus: 'invalid_status' });
    await expect(Request.create(invalidRequest)).rejects.toThrow(mongoose.Error.ValidationError);
  });

  // Add more tests here for other validations and custom methods if any
});