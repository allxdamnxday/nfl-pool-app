const Pool = require('../models/Pool');
const Request = require('../models/Request');
const Entry = require('../models/Entry');
const BaseService = require('./baseService');
const ErrorResponse = require('../utils/errorResponse');
const logger = require('../utils/logger');

class PoolService extends BaseService {
  constructor() {
    super(Pool);
  }

  async getAvailablePools(userId) {
    logger.info(`Fetching available pools for user ${userId}`);
    const pools = await Pool.find({ status: 'open' });
    
    return Promise.all(pools.map(async (pool) => {
      const requests = await Request.find({ user: userId, pool: pool._id });
      const entries = await Entry.find({ user: userId, pool: pool._id });
      
      return {
        ...pool.toObject(),
        userRequests: requests.length,
        userEntries: entries.length,
        canJoin: requests.length + entries.length < 3
      };
    }));
  }

  async createPool(userId, poolData) {
    logger.info(`Creating new pool for user ${userId}`);
    poolData.creator = userId;
    return await this.create(poolData);
  }

  async updatePool(poolId, userId, updateData) {
    logger.info(`Updating pool ${poolId} for user ${userId}`);
    const pool = await this.getById(poolId);
    
    if (pool.creator.toString() !== userId) {
      throw new ErrorResponse(`User ${userId} is not authorized to update this pool`, 403);
    }
    
    return await this.update(poolId, updateData);
  }

  async deletePool(poolId, userId) {
    logger.info(`Deleting pool ${poolId} for user ${userId}`);
    const pool = await this.getById(poolId);
    
    if (pool.creator.toString() !== userId) {
      throw new ErrorResponse(`User ${userId} is not authorized to delete this pool`, 403);
    }
    
    return await this.delete(poolId);
  }

  async getPoolStats(poolId) {
    logger.info(`Fetching stats for pool ${poolId}`);
    const pool = await this.getById(poolId);
    const stats = {
      totalParticipants: pool.participants.length,
      eliminatedParticipants: pool.eliminatedUsers.length,
      currentWeek: pool.currentWeek
    };
    return stats;
  }

  async updatePoolStatus(poolId, status) {
    logger.info(`Updating status of pool ${poolId} to ${status}`);
    if (!['open', 'active', 'completed'].includes(status)) {
      throw new ErrorResponse('Invalid status. Must be open, active, or completed.', 400);
    }
    return await this.update(poolId, { status });
  }
}

module.exports = new PoolService();