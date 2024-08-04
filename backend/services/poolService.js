const Pool = require('../models/Pool');
const Request = require('../models/Request');
const Entry = require('../models/Entry');

exports.getAvailablePools = async (userId) => {
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
};

// Other pool-related methods...