const mongoose = require('mongoose');
const Pool = require('../models/Pool');
const Entry = require('../models/Entry');
const Pick = require('../models/Pick');
const Request = require('../models/Request');
const User = require('../models/User');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function safeDeletePool(poolId) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Delete entries
    await Entry.deleteMany({ pool: poolId }).session(session);

    // Delete picks
    await Pick.deleteMany({ pool: poolId }).session(session);

    // Delete requests
    await Request.deleteMany({ pool: poolId }).session(session);

    // Update users (remove pool from participants and eliminatedUsers)
    await User.updateMany(
      { $or: [{ participants: poolId }, { eliminatedUsers: poolId }] },
      { $pull: { participants: poolId, eliminatedUsers: poolId } }
    ).session(session);

    // Delete the pool
    const deletedPool = await Pool.findByIdAndDelete(poolId).session(session);

    await session.commitTransaction();
    console.log(`Pool ${poolId} and related data safely deleted`);
    return deletedPool;
  } catch (error) {
    await session.abortTransaction();
    console.error(`Error deleting pool ${poolId}:`, error);
    throw error;
  } finally {
    session.endSession();
  }
}

async function deleteMultiplePools(poolIds) {
  for (const poolId of poolIds) {
    try {
      const deletedPool = await safeDeletePool(poolId);
      if (deletedPool) {
        console.log(`Successfully deleted pool: ${deletedPool.name} (${poolId})`);
      } else {
        console.log(`Pool not found: ${poolId}`);
      }
    } catch (error) {
      console.error(`Failed to delete pool ${poolId}:`, error);
    }
  }
}

// Array of pool IDs to delete
const poolIdsToDelete = [
  '669fecc91970903968067cd4',  // Replace with actual pool IDs
  '669fecc91970903968067cd5',
  '669fecc91970903968067cd6',
  '669fecc91970903968067cd7',
  '669ff9331aca1908a0f23442',
  '669ff9341aca1908a0f23445',
  '669ff9341aca1908a0f23448',
  '669ff9341aca1908a0f2344b'


];

deleteMultiplePools(poolIdsToDelete)
  .then(() => {
    console.log('Pool deletion process completed');
    mongoose.connection.close();
  })
  .catch((error) => {
    console.error('An error occurred during the pool deletion process:', error);
    mongoose.connection.close();
  });