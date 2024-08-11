/**
 * @module RequestService
 * @description Service for managing entry requests in the NFL pool application
 */

const BaseService = require('./baseService');
const mongoose = require('mongoose');
const Request = require('../models/Request');
const Pool = require('../models/Pool');
const Entry = require('../models/Entry');
const ErrorResponse = require('../utils/errorResponse');
const testLogger = require('../utils/testLogger');

/**
 * Service class for managing requests
 * @class RequestService
 * @extends BaseService
 */
class RequestService extends BaseService {
  constructor() {
    super(Request);
  }

  /**
   * Create a new request for pool entries
   * @async
   * @param {string} userId - The ID of the user making the request
   * @param {string} poolId - The ID of the pool to join
   * @param {number} numberOfEntries - The number of entries requested (1-3)
   * @returns {Promise<Object>} The created request object
   * @throws {ErrorResponse} If pool is not found or maximum entries exceeded
   * 
   * @example
   * try {
   *   const request = await requestService.createRequest('user123', 'pool456', 2);
   *   console.log(request);
   * } catch (error) {
   *   console.error(error.message);
   * }
   */
  async createRequest(userId, poolId, numberOfEntries) {
    testLogger.info(`Creating request for user ${userId} in pool ${poolId} for ${numberOfEntries} entries`);
    const pool = await Pool.findById(poolId);
    if (!pool) {
      testLogger.error(`No pool found with id of ${poolId}`);
      throw new ErrorResponse(`No pool found with id of ${poolId}`, 404);
    }
  
    const existingCount = await this.getUserRequestAndEntryCount(userId, poolId);
    if (existingCount + numberOfEntries > 3) {
      testLogger.warn(`User ${userId} attempted to exceed maximum entries for pool ${poolId}`);
      throw new ErrorResponse('You can have a maximum of 3 entries per pool', 400);
    }
  
    // Calculate the number of new entries (excluding already approved entries)
    const approvedEntries = await Entry.countDocuments({ user: userId, pool: poolId });
    const newEntries = Math.min(3 - approvedEntries, numberOfEntries);
  
    const totalAmount = newEntries * pool.entryFee; // Calculate total amount based on new entries
  
    const request = await Request.create({
      user: userId,
      pool: poolId,
      numberOfEntries: newEntries, // Store the number of new entries
      status: 'pending',
      totalAmount
    });
  
    testLogger.info(`Request created successfully: ${request._id}`);
    return request;
  }

  /**
   * Confirm payment for a request
   * @async
   * @param {string} requestId - The ID of the request to confirm payment for
   * @param {string} userId - The ID of the user confirming the payment
   * @param {string} transactionId - The transaction ID from the payment processor
   * @param {string} paymentType - The type of payment (e.g., 'credit_card', 'paypal')
   * @returns {Promise<Object>} The updated request object with confirmed payment
   * @throws {ErrorResponse} If request is not found or user is not authorized
   * 
   * @example
   * try {
   *   const updatedRequest = await requestService.confirmPayment('request789', 'user123', 'txn_123456', 'credit_card');
   *   console.log(updatedRequest);
   * } catch (error) {
   *   console.error(error.message);
   * }
   */
  async confirmPayment(requestId, userId, transactionId, paymentType) {
    const request = await Request.findOne({ _id: requestId, user: userId });

    if (!request) {
      throw new ErrorResponse('Request not found', 404);
    }

    if (request.user.toString() !== userId.toString()) {  // Add .toString() to both sides
      testLogger.warn(`User ${userId} is not authorized to confirm payment for this request`);
      throw new ErrorResponse(`User ${userId} is not authorized to confirm payment for this request`, 403);
    }
  
    request.paymentStatus = 'confirmed';
    request.transactionId = transactionId;
    request.paymentType = paymentType;
    await request.save();
  
    testLogger.info(`Request ${requestId} payment confirmed`);
    return request;
  }

  /**
   * Approve a request and create corresponding entries
   * @async
   * @param {string} requestId - The ID of the request to approve
   * @returns {Promise<Object>} Object containing the approved request and created entries
   * @throws {ErrorResponse} If request is not found, payment not confirmed, or already approved
   * 
   * @example
   * try {
   *   const { request, entries } = await requestService.approveRequest('request789');
   *   console.log('Approved request:', request);
   *   console.log('Created entries:', entries);
   * } catch (error) {
   *   console.error(error.message);
   * }
   */
  async approveRequest(requestId) {
    try {
      const request = await Request.findById(requestId);
      if (!request) {
        throw new ErrorResponse(`No request found with id of ${requestId}`, 404);
      }

      if (request.paymentStatus !== 'confirmed') {
        throw new ErrorResponse(`Request ${requestId} payment has not been confirmed`, 400);
      }

      if (request.status !== 'pending') {
        throw new ErrorResponse(`Request ${requestId} is not in pending status`, 400);
      }

      request.status = 'approved';
      await request.save();

      const entries = [];
      for (let i = 0; i < request.numberOfEntries; i++) {
        const entry = await Entry.create({
          user: request.user,
          pool: request.pool,
          entryNumber: i + 1,
          request: request._id,
          status: 'active'  // Explicitly set the status to 'active'
        });
        entries.push(entry);
      }

      testLogger.info(`Request ${requestId} approved and ${entries.length} entries created`);
      return { request, entries };
    } catch (error) {
      testLogger.error(`Error approving request: ${error.message}`);
      throw error;
    }
  }

  /**
   * Reject a request
   * @async
   * @param {string} requestId - The ID of the request to reject
   * @returns {Promise<Object>} The rejected request object
   * @throws {ErrorResponse} If request is not found or already approved
   * 
   * @example
   * try {
   *   const rejectedRequest = await requestService.rejectRequest('request789');
   *   console.log('Rejected request:', rejectedRequest);
   * } catch (error) {
   *   console.error(error.message);
   * }
   */
  async rejectRequest(requestId) {
    const request = await Request.findById(requestId);
    if (!request) {
      testLogger.error(`No request found with id of ${requestId}`);
      throw new ErrorResponse(`No request found with id of ${requestId}`, 404);
    }

    if (request.status === 'approved') {
      throw new ErrorResponse(`Cannot reject an already approved request`, 400);
    }

    request.status = 'rejected';
    await request.save();

    testLogger.info(`Request ${requestId} rejected`);
    return request;
  }

  /**
   * Get the count of user requests and entries for a pool
   * @async
   * @param {string} userId - The ID of the user
   * @param {string} poolId - The ID of the pool
   * @returns {Promise<number>} The total count of approved entries and pending requests
   * 
   * @example
   * const count = await requestService.getUserRequestAndEntryCount('user123', 'pool456');
   * console.log('Total count:', count);
   */
  async getUserRequestAndEntryCount(userId, poolId) {
    const approvedEntries = await Entry.countDocuments({ user: userId, pool: poolId });
    const pendingRequests = await Request.aggregate([
      { $match: { user: mongoose.Types.ObjectId(userId), pool: mongoose.Types.ObjectId(poolId), status: 'pending' } },
      { $group: { _id: null, totalEntries: { $sum: '$numberOfEntries' } } }
    ]);

    const pendingEntriesCount = pendingRequests.length > 0 && pendingRequests[0].totalEntries ? pendingRequests[0].totalEntries : 0;
    return approvedEntries + pendingEntriesCount;
  }

  /**
   * Get all requests across all pools
   * @async
   * @returns {Promise<Array>} Array of all requests with populated user and pool information
   * 
   * @example
   * const allRequests = await requestService.getAllRequests();
   * console.log('All requests:', allRequests);
   */
  async getAllRequests() {
    return await Request.find().populate('user', 'username').populate('pool', 'name');
  }

  /**
   * Get all requests for a specific pool
   * @async
   * @param {string} poolId - The ID of the pool
   * @returns {Promise<Array>} Array of requests for the pool with populated user information
   * @throws {ErrorResponse} If pool is not found
   * 
   * @example
   * try {
   *   const poolRequests = await requestService.getPoolRequests('pool456');
   *   console.log('Pool requests:', poolRequests);
   * } catch (error) {
   *   console.error(error.message);
   * }
   */
  async getPoolRequests(poolId) {
    const pool = await Pool.findById(poolId);
    if (!pool) {
      testLogger.error(`No pool found with id of ${poolId}`);
      throw new ErrorResponse(`No pool found with id of ${poolId}`, 404);
    }
    return await Request.find({ pool: poolId }).populate('user', 'username');
  }

  /**
   * Get all requests for a specific user
   * @async
   * @param {string} userId - The ID of the user
   * @returns {Promise<Array>} Array of requests made by the user with populated pool information
   * 
   * @example
   * const userRequests = await requestService.getUserRequests('user123');
   * console.log('User requests:', userRequests);
   */
  async getUserRequests(userId) {
    return await Request.find({ user: userId }).populate('pool', 'name');
  }

  /**
   * Get a specific request by its ID
   * @async
   * @param {string} requestId - The ID of the request to retrieve
   * @returns {Promise<Object>} The request object
   * @throws {ErrorResponse} If request is not found
   * 
   * @example
   * try {
   *   const request = await requestService.getRequestById('request789');
   *   console.log('Request:', request);
   * } catch (error) {
   *   console.error(error.message);
   * }
   */
  async getRequestById(requestId) {
    const request = await Request.findById(requestId);
    if (!request) {
      testLogger.error(`No request found with id of ${requestId}`);
      throw new ErrorResponse(`No request found with id of ${requestId}`, 404);
    }
    return request;
  }
}

module.exports = new RequestService();