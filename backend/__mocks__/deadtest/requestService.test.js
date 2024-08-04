const mongoose = require('mongoose');
const requestService = require('../../services/requestService');
const Request = require('../../models/Request');
const Entry = require('../../models/Entry');
const User = require('../../models/User');
const Pool = require('../../models/Pool');
const { connectToDatabase, closeDatabase, clearDatabase } = require('../testUtils');

describe('Request Service', () => {
  let user, pool;

  beforeAll(async () => {
    await connectToDatabase();
  });

  afterAll(async () => {
    await closeDatabase();
  });

  beforeEach(async () => {
    await clearDatabase();
    user = await User.create({
      firstName: 'Test',
      lastName: 'User',
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    });
    pool = await Pool.create({
      name: 'Test Pool',
      entryFee: 50,
      maxEntries: 10
    });
  });

  describe('createRequest', () => {
    it('should create a new request', async () => {
      const requestData = {
        userId: user._id,
        poolId: pool._id,
        numberOfEntries: 2,
        totalAmount: 100 // 2 * 50 (entryFee)
      };

      const request = await requestService.createRequest(requestData);

      expect(request).toBeDefined();
      expect(request.user.toString()).toBe(user._id.toString());
      expect(request.pool.toString()).toBe(pool._id.toString());
      expect(request.numberOfEntries).toBe(2);
      expect(request.status).toBe('pending');
      expect(request.totalAmount).toBe(100);
    });

    it('should throw an error if user exceeds maximum entries', async () => {
      const userId = new mongoose.Types.ObjectId();
      const poolId = new mongoose.Types.ObjectId();
      await Request.create({ user: userId, pool: poolId, numberOfEntries: 2 });
      await Entry.create({ user: userId, pool: poolId, entryNumber: 1 });

      await expect(requestService.createRequest(userId, poolId, 2)).rejects.toThrow('You can have a maximum of 3 entries per pool');
    });
  });

  describe('confirmPayment', () => {
    it('should update request with payment details', async () => {
      const userId = new mongoose.Types.ObjectId();
      const request = await Request.create({ user: userId, pool: new mongoose.Types.ObjectId(), numberOfEntries: 1 });
      const paymentDetails = { paymentMethod: 'paypal', transactionId: 'abc123' };

      const updatedRequest = await requestService.confirmPayment(request._id, userId, paymentDetails);

      expect(updatedRequest.paymentMethod).toBe('paypal');
      expect(updatedRequest.paymentConfirmation).toBe('abc123');
      expect(updatedRequest.status).toBe('payment_pending');
    });
  });

  describe('approveRequest', () => {
    it('should approve request and create entries', async () => {
      const userId = new mongoose.Types.ObjectId();
      const poolId = new mongoose.Types.ObjectId();
      const request = await Request.create({
        user: userId,
        pool: poolId,
        numberOfEntries: 2,
        status: 'payment_pending'
      });

      const { request: updatedRequest, entries } = await requestService.approveRequest(request._id);

      expect(updatedRequest.status).toBe('approved');
      expect(entries).toHaveLength(2);
      expect(entries[0].user.toString()).toBe(userId.toString());
      expect(entries[0].pool.toString()).toBe(poolId.toString());
      expect(entries[0].entryNumber).toBe(1);
      expect(entries[1].entryNumber).toBe(2);
    });
  });

  describe('rejectRequest', () => {
    it('should reject the request', async () => {
      const userId = new mongoose.Types.ObjectId();
      const request = await Request.create({ user: userId, pool: new mongoose.Types.ObjectId(), numberOfEntries: 1 });
      const rejectedRequest = await requestService.rejectRequest(request._id);

      expect(rejectedRequest.status).toBe('rejected');
    });
  });
});