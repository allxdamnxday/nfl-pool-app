// __tests__/services/requestService.test.js

const mongoose = require('mongoose');
const RequestService = require('../../services/requestService');
const User = require('../../models/User');
const Pool = require('../../models/Pool');
const Request = require('../../models/Request');
const Entry = require('../../models/Entry');
const ErrorResponse = require('../../utils/errorResponse');
const { connect, closeDatabase, clearDatabase } = require('../testSetup');
const { createTestUser, createTestPool, createTestRequest, createTestEntry } = require('../testUtils');

describe('RequestService', () => {
  beforeAll(async () => await connect());
  afterEach(async () => await clearDatabase());
  afterAll(async () => await closeDatabase());

  describe('createRequest', () => {
    it('should create a new request successfully', async () => {
      const user = await createTestUser();
      const pool = await createTestPool(user._id, { entryFee: 50 });

      const request = await RequestService.createRequest(user._id, pool._id, 2);

      expect(request).toBeDefined();
      expect(request.user.toString()).toBe(user._id.toString());
      expect(request.pool.toString()).toBe(pool._id.toString());
      expect(request.numberOfEntries).toBe(2);
      expect(request.status).toBe('pending');
      expect(request.totalAmount).toBe(100); // 2 * 50
    });

    it('should throw an error if pool does not exist', async () => {
      const user = await createTestUser();
      const fakePoolId = new mongoose.Types.ObjectId();

      await expect(RequestService.createRequest(user._id, fakePoolId, 1))
        .rejects.toThrow(ErrorResponse);
    });

    it('should throw an error if maximum entries exceeded', async () => {
      const user = await createTestUser();
      const pool = await createTestPool(user._id);
      await createTestRequest(user._id, pool._id, { numberOfEntries: 3 });

      await expect(RequestService.createRequest(user._id, pool._id, 1))
        .rejects.toThrow('You can have a maximum of 3 entries per pool');
    });
  });

  describe('confirmPayment', () => {
    it('should confirm payment for a request', async () => {
      const user = await createTestUser();
      const pool = await createTestPool(user._id);
      const request = await createTestRequest(user._id, pool._id);
  
      const updatedRequest = await RequestService.confirmPayment(request._id, user._id.toString(), 'txn_123', 'credit_card');
  
      expect(updatedRequest.paymentStatus).toBe('confirmed');
      expect(updatedRequest.transactionId).toBe('txn_123');
      expect(updatedRequest.paymentType).toBe('credit_card');
    });
  

    it('should throw an error if request does not exist', async () => {
      const user = await createTestUser();
      const fakeRequestId = new mongoose.Types.ObjectId();

      await expect(RequestService.confirmPayment(fakeRequestId, user._id, 'txn_123', 'credit_card'))
        .rejects.toThrow(ErrorResponse);
    });

    it('should throw an error if user is not authorized', async () => {
      const user1 = await createTestUser();
      const user2 = await createTestUser();
      const pool = await createTestPool(user1._id);
      const request = await createTestRequest(user1._id, pool._id);

      await expect(RequestService.confirmPayment(request._id, user2._id, 'txn_123', 'credit_card'))
        .rejects.toThrow(ErrorResponse);
    });
  });

  describe('approveRequest', () => {
    it('should approve a request and create entries', async () => {
      const user = await createTestUser();
      const pool = await createTestPool(user._id);
      const request = await createTestRequest(user._id, pool._id, { numberOfEntries: 2, paymentStatus: 'confirmed' });

      const { request: approvedRequest, entries } = await RequestService.approveRequest(request._id);

      expect(approvedRequest.status).toBe('approved');
      expect(entries).toHaveLength(2);
      entries.forEach(entry => {
        expect(entry.user.toString()).toBe(user._id.toString());
        expect(entry.pool.toString()).toBe(pool._id.toString());
      });
    });

    it('should throw an error if request does not exist', async () => {
      const fakeRequestId = new mongoose.Types.ObjectId();

      await expect(RequestService.approveRequest(fakeRequestId))
        .rejects.toThrow(ErrorResponse);
    });

    it('should throw an error if payment is not confirmed', async () => {
      const user = await createTestUser();
      const pool = await createTestPool(user._id);
      const request = await createTestRequest(user._id, pool._id);

      await expect(RequestService.approveRequest(request._id))
        .rejects.toThrow('payment has not been confirmed');
    });

    it('should throw an error if request is already approved', async () => {
        const user = await createTestUser();
        const pool = await createTestPool(user._id);
        const request = await createTestRequest(user._id, pool._id, { status: 'approved', paymentStatus: 'confirmed' });
      
        await expect(RequestService.approveRequest(request._id))
          .rejects.toThrow(`Request ${request._id} is not in pending status`);
      });
  });

  describe('rejectRequest', () => {
    it('should reject a request', async () => {
      const user = await createTestUser();
      const pool = await createTestPool(user._id);
      const request = await createTestRequest(user._id, pool._id);

      const rejectedRequest = await RequestService.rejectRequest(request._id);

      expect(rejectedRequest.status).toBe('rejected');
    });

    it('should throw an error if request does not exist', async () => {
      const fakeRequestId = new mongoose.Types.ObjectId();

      await expect(RequestService.rejectRequest(fakeRequestId))
        .rejects.toThrow(ErrorResponse);
    });

    it('should throw an error if request is already approved', async () => {
      const user = await createTestUser();
      const pool = await createTestPool(user._id);
      const request = await createTestRequest(user._id, pool._id, { status: 'approved' });

      await expect(RequestService.rejectRequest(request._id))
        .rejects.toThrow('Cannot reject an already approved request');
    });
  });

  describe('getUserRequestAndEntryCount', () => {
    it('should return correct count of requests and entries', async () => {
      const user = await createTestUser();
      const pool = await createTestPool(user._id);
      await createTestRequest(user._id, pool._id, { numberOfEntries: 1, status: 'pending' });
      await createTestEntry(user._id, pool._id, new mongoose.Types.ObjectId());

      const count = await RequestService.getUserRequestAndEntryCount(user._id, pool._id);

      expect(count).toBe(2); // 1 pending request + 1 approved entry
    });
  });

  describe('getAllRequests', () => {
    it('should return all requests with populated user and pool', async () => {
      const user = await createTestUser();
      const pool = await createTestPool(user._id);
      await createTestRequest(user._id, pool._id);

      const requests = await RequestService.getAllRequests();

      expect(requests).toHaveLength(1);
      expect(requests[0].user).toHaveProperty('username');
      expect(requests[0].pool).toHaveProperty('name');
    });
  });

  describe('getPoolRequests', () => {
    it('should return all requests for a specific pool', async () => {
      const user = await createTestUser();
      const pool = await createTestPool(user._id);
      await createTestRequest(user._id, pool._id);

      const requests = await RequestService.getPoolRequests(pool._id);

      expect(requests).toHaveLength(1);
      expect(requests[0].user).toHaveProperty('username');
    });

    it('should throw an error if pool does not exist', async () => {
      const fakePoolId = new mongoose.Types.ObjectId();

      await expect(RequestService.getPoolRequests(fakePoolId))
        .rejects.toThrow(ErrorResponse);
    });
  });

  describe('getUserRequests', () => {
    it('should return all requests for a specific user', async () => {
      const user = await createTestUser();
      const pool = await createTestPool(user._id);
      await createTestRequest(user._id, pool._id);

      const requests = await RequestService.getUserRequests(user._id);

      expect(requests).toHaveLength(1);
      expect(requests[0].pool).toHaveProperty('name');
    });
  });

  describe('getRequestById', () => {
    it('should return a specific request by ID', async () => {
      const user = await createTestUser();
      const pool = await createTestPool(user._id);
      const createdRequest = await createTestRequest(user._id, pool._id);

      const request = await RequestService.getRequestById(createdRequest._id);

      expect(request._id.toString()).toBe(createdRequest._id.toString());
    });

    it('should throw an error if request does not exist', async () => {
      const fakeRequestId = new mongoose.Types.ObjectId();

      await expect(RequestService.getRequestById(fakeRequestId))
        .rejects.toThrow(ErrorResponse);
    });
  });
});