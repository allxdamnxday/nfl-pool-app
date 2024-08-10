const request = require('supertest');
const express = require('express');
const requestRoutes = require('../../routes/requests');
const RequestService = require('../../services/requestService');
const { protect, authorize } = require('../../middleware/auth');
const ErrorResponse = require('../../utils/errorResponse');
const errorHandler = require('../../middleware/error');

// Mock the RequestService
jest.mock('../../services/requestService');

// Mock the middleware
jest.mock('../../middleware/auth', () => ({
  protect: jest.fn((req, res, next) => {
    req.user = { id: 'mockUserId' };
    next();
  }),
  authorize: jest.fn(() => (req, res, next) => next())
}));

const app = express();
app.use(express.json());
app.use('/api/v1/requests', requestRoutes);
app.use(errorHandler); // Add this line

// Add this at the top of your test file
process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled Rejection at:', promise, 'reason:', reason);
});

describe('Request Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v1/requests', () => {
    it('should create a new request', async () => {
      const mockRequest = {
        poolId: 'mockPoolId',
        numberOfEntries: 2
      };
      const mockCreatedRequest = {
        _id: 'mockRequestId',
        ...mockRequest,
        user: 'mockUserId',
        status: 'pending'
      };

      RequestService.getUserRequestAndEntryCount.mockResolvedValue(0);
      RequestService.createRequest.mockResolvedValue(mockCreatedRequest);

      const res = await request(app)
        .post('/api/v1/requests')
        .send(mockRequest);

      expect(res.statusCode).toBe(201);
      expect(res.body).toEqual({
        success: true,
        data: mockCreatedRequest
      });
      expect(RequestService.createRequest).toHaveBeenCalledWith('mockUserId', mockRequest.poolId, mockRequest.numberOfEntries);
    });

    it('should handle errors when creating a request', async () => {
      const mockRequest = {
        poolId: 'mockPoolId',
        numberOfEntries: 4 // Exceeds maximum allowed
      };

      RequestService.getUserRequestAndEntryCount.mockResolvedValue(0);
      RequestService.createRequest.mockRejectedValue(new ErrorResponse('You can have a maximum of 3 entries per pool', 400));

      const res = await request(app)
        .post('/api/v1/requests')
        .send(mockRequest);

      console.log('Full response:', res);

      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({
        success: false,
        error: 'You can have a maximum of 3 entries per pool'
      });
    });
  });

  describe('PUT /api/v1/requests/:id/confirm-payment', () => {
    it('should confirm payment for a request', async () => {
      const mockPayment = {
        transactionId: 'mockTransactionId',
        paymentType: 'credit_card'
      };
      const mockUpdatedRequest = {
        _id: 'mockRequestId',
        ...mockPayment,
        status: 'payment_confirmed'
      };

      RequestService.confirmPayment.mockResolvedValue(mockUpdatedRequest);

      const res = await request(app)
        .put('/api/v1/requests/mockRequestId/confirm-payment')
        .send(mockPayment);

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        success: true,
        data: mockUpdatedRequest
      });
      expect(RequestService.confirmPayment).toHaveBeenCalledWith('mockRequestId', 'mockUserId', mockPayment.transactionId, mockPayment.paymentType);
    });

    it('should handle errors when confirming payment', async () => {
      const mockPayment = {
        transactionId: 'mockTransactionId',
        paymentType: 'credit_card'
      };

      RequestService.confirmPayment.mockRejectedValue(new ErrorResponse('Request not found', 404));

      const res = await request(app)
        .put('/api/v1/requests/mockRequestId/confirm-payment')
        .send(mockPayment);

      expect(res.statusCode).toBe(404);
      expect(res.body).toEqual({
        success: false,
        error: 'Request not found'
      });
    });
  });

  describe('PUT /api/v1/requests/:id/approve', () => {
    it('should approve a request', async () => {
      const mockApprovedRequest = {
        _id: 'mockRequestId',
        status: 'approved'
      };
      const mockEntries = [{ _id: 'entry1' }, { _id: 'entry2' }];

      RequestService.approveRequest.mockResolvedValue({ request: mockApprovedRequest, entries: mockEntries });

      const res = await request(app)
        .put('/api/v1/requests/mockRequestId/approve');

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        success: true,
        data: { request: mockApprovedRequest, entries: mockEntries }
      });
      expect(RequestService.approveRequest).toHaveBeenCalledWith('mockRequestId');
    });
  });

  describe('PUT /api/v1/requests/:id/reject', () => {
    it('should reject a request', async () => {
      const mockRejectedRequest = {
        _id: 'mockRequestId',
        status: 'rejected'
      };

      RequestService.rejectRequest.mockResolvedValue(mockRejectedRequest);

      const res = await request(app)
        .put('/api/v1/requests/mockRequestId/reject');

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        success: true,
        data: mockRejectedRequest
      });
      expect(RequestService.rejectRequest).toHaveBeenCalledWith('mockRequestId');
    });
  });

  describe('GET /api/v1/requests', () => {
    it('should get all requests for the current user', async () => {
      const mockRequests = [
        { _id: 'mockRequestId1', status: 'pending' },
        { _id: 'mockRequestId2', status: 'approved' }
      ];

      RequestService.getUserRequests.mockResolvedValue(mockRequests);

      const res = await request(app).get('/api/v1/requests');

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        success: true,
        count: mockRequests.length,
        data: mockRequests
      });
      expect(RequestService.getUserRequests).toHaveBeenCalledWith('mockUserId');
    });
  });

  describe('GET /api/v1/requests/pool/:poolId', () => {
    it('should get all requests for a specific pool', async () => {
      const mockPoolRequests = [
        { _id: 'mockRequestId1', status: 'pending' },
        { _id: 'mockRequestId2', status: 'approved' }
      ];

      RequestService.getPoolRequests.mockResolvedValue(mockPoolRequests);

      const res = await request(app).get('/api/v1/requests/pool/mockPoolId');

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        success: true,
        count: mockPoolRequests.length,
        data: mockPoolRequests
      });
      expect(RequestService.getPoolRequests).toHaveBeenCalledWith('mockPoolId');
    });
  });
});