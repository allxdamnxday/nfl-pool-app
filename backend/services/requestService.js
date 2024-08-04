//backend/services/requestService.js

const BaseService = require('./baseService');
const mongoose = require('mongoose');
const Request = require('../models/Request');
const Pool = require('../models/Pool');
const Entry = require('../models/Entry');
const ErrorResponse = require('../utils/errorResponse');
const logger = require('../utils/logger');

class RequestService extends BaseService {
  constructor() {
    super(Request);
  }

  async createRequest(userId, poolId, numberOfEntries) {
    logger.info(`Creating request for user ${userId} in pool ${poolId} for ${numberOfEntries} entries`);
    const pool = await Pool.findById(poolId);
    if (!pool) {
      logger.error(`No pool found with id of ${poolId}`);
      throw new ErrorResponse(`No pool found with id of ${poolId}`, 404);
    }

    const existingCount = await this.getUserRequestAndEntryCount(userId, poolId);
    if (existingCount + numberOfEntries > 3) {
      logger.warn(`User ${userId} attempted to exceed maximum entries for pool ${poolId}`);
      throw new ErrorResponse('You can have a maximum of 3 entries per pool', 400);
    }

    const entryNumber = existingCount + 1;
    const request = await Request.create({
      user: userId,
      pool: poolId,
      numberOfEntries,
      entryNumber,
      status: 'pending'
    });

    logger.info(`Request created successfully: ${request._id}`);
    return request;
  }

  async confirmPayment(requestId, userId, paymentDetails) {
    const request = await Request.findById(requestId);
    if (!request) {
      logger.error(`No request found with id of ${requestId}`);
      throw new ErrorResponse(`No request found with id of ${requestId}`, 404);
    }

    if (request.user.toString() !== userId) {
      logger.warn(`User ${userId} is not authorized to confirm payment for this request`);
      throw new ErrorResponse(`User ${userId} is not authorized to confirm payment for this request`, 403);
    }

    if (request.status !== 'pending') {
      logger.warn(`Request ${requestId} is not in a pending state`);
      throw new ErrorResponse(`Request ${requestId} is not in a pending state`, 400);
    }

    request.status = 'payment_pending';
    request.paymentMethod = paymentDetails.paymentMethod;
    request.paymentConfirmation = paymentDetails.transactionId;

    await request.save();

    logger.info(`Request ${requestId} payment confirmed`);
    return request;
  }

  async approveRequest(requestId) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const request = await Request.findById(requestId).session(session);
      if (!request) {
        throw new ErrorResponse(`No request found with id of ${requestId}`, 404);
      }

      if (request.status !== 'payment_pending') {
        throw new ErrorResponse(`Request ${requestId} is not ready for approval`, 400);
      }

      request.status = 'approved';
      await request.save({ session });

      const entries = [];
      for (let i = 0; i < request.numberOfEntries; i++) {
        entries.push(await Entry.create([{
          user: request.user,
          pool: request.pool,
          entryNumber: request.entryNumber + i
        }], { session }));
      }

      await session.commitTransaction();
      session.endSession();

      return { request, entries: entries.flat() };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  async rejectRequest(requestId) {
    const request = await Request.findById(requestId);
    if (!request) {
      logger.error(`No request found with id of ${requestId}`);
      throw new ErrorResponse(`No request found with id of ${requestId}`, 404);
    }

    request.status = 'rejected';
    await request.save();

    logger.info(`Request ${requestId} rejected`);
    return request;
  }

  async getUserRequestAndEntryCount(userId, poolId) {
    const requestCount = await Request.countDocuments({ user: userId, pool: poolId });
    const entryCount = await Entry.countDocuments({ user: userId, pool: poolId });
    return requestCount + entryCount;
  }

  async getAllRequests() {
    return await Request.find().populate('user', 'username').populate('pool', 'name');
  }

  async getPoolRequests(poolId) {
    const pool = await Pool.findById(poolId);
    if (!pool) {
      logger.error(`No pool found with id of ${poolId}`);
      throw new ErrorResponse(`No pool found with id of ${poolId}`, 404);
    }
    return await Request.find({ pool: poolId }).populate('user', 'username');
  }

  async getUserRequests(userId) {
    return await Request.find({ user: userId }).populate('pool', 'name');
  }

  async getRequestById(requestId) {
    const request = await Request.findById(requestId);
    if (!request) {
      logger.error(`No request found with id of ${requestId}`);
      throw new ErrorResponse(`No request found with id of ${requestId}`, 404);
    }
    return request;
  }
}

module.exports = new RequestService();