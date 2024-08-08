const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Request = require('../models/Request');
const Entry = require('../models/Entry');
const Pool = require('../models/Pool');
const Pick = require('../models/Pick');
const Game = require('../models/Game');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { 
  createUser, 
  createAdmin, 
  createRequest, 
  createPool, 
  createEntry, 
  createPick, 
  createGame,
  createObjectId
} = require('./mockDataFactory');

let mongod;

/**
 * Connect to the in-memory database.
 */
module.exports.connect = async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  });
};

/**
 * Drop database, close the connection and stop mongod.
 */
module.exports.closeDatabase = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongod.stop();
};

/**
 * Remove all the data for all db collections.
 */
module.exports.clearDatabase = async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany();
  }
};

/**
 * Create a test user with optional custom data.
 * @param {Object} customData - Custom user data to override defaults.
 * @returns {Promise<User>} The created user document.
 */
module.exports.createTestUser = async (customData = {}) => {
  const userData = createUser(customData);
  if (!customData.password) {
    const salt = await bcrypt.genSalt(10);
    userData.password = await bcrypt.hash(userData.password, salt);
  }
  return await User.create(userData);
};

/**
 * Create a test admin user.
 * @returns {Promise<User>} The created admin user document.
 */
module.exports.createTestAdmin = async (customData = {}) => {
  const adminData = createAdmin(customData);
  return this.createTestUser(adminData);
};

/**
 * Create a test request with optional custom data.
 * @param {mongoose.Types.ObjectId} userId - The user ID for the request.
 * @param {mongoose.Types.ObjectId} poolId - The pool ID for the request.
 * @param {Object} customData - Custom request data to override defaults.
 * @returns {Promise<Request>} The created request document.
 */
module.exports.createTestRequest = async (userId, poolId, customData = {}) => {
  const requestData = createRequest(userId, poolId, customData);
  return await Request.create(requestData);
};

/**
 * Create a test pool with optional custom data.
 * @param {mongoose.Types.ObjectId} creatorId - The ID of the user creating the pool.
 * @param {Object} customData - Custom pool data to override defaults.
 * @returns {Promise<Pool>} The created pool document.
 */
module.exports.createTestPool = async (creatorId, customData = {}) => {
  const poolData = createPool(creatorId, customData);
  return await Pool.create(poolData);
};

/**
 * Create a test entry with optional custom data.
 * @param {mongoose.Types.ObjectId} userId - The user ID for the entry.
 * @param {mongoose.Types.ObjectId} poolId - The pool ID for the entry.
 * @param {mongoose.Types.ObjectId} requestId - The request ID for the entry.
 * @param {Object} customData - Custom entry data to override defaults.
 * @returns {Promise<Entry>} The created entry document.
 */
module.exports.createTestEntry = async (userId, poolId, requestId, customData = {}) => {
  const entryData = createEntry(userId, poolId, requestId, customData);
  return await Entry.create(entryData);
};

/**
 * Create a test pick with optional custom data.
 * @param {mongoose.Types.ObjectId} entryId - The entry ID for the pick.
 * @param {mongoose.Types.ObjectId} userId - The user ID for the pick.
 * @param {mongoose.Types.ObjectId} poolId - The pool ID for the pick.
 * @param {Object} customData - Custom pick data to override defaults.
 * @returns {Promise<Pick>} The created pick document.
 */
module.exports.createTestPick = async (entryId, customData = {}) => {
  console.log('Creating Pick with:', { entryId, customData });
  const pickData = createPick(entryId, {
    week: customData.week || 1,
    entryNumber: customData.entryNumber || 1,
    ...customData
  });
  console.log('Pick data before creation:', pickData);
  const createdPick = await Pick.create(pickData);
  console.log('Created Pick:', JSON.stringify(createdPick, null, 2));
  return createdPick;
};
/**
 * Create a test game with optional custom data.
 * @param {Object} customData - Custom game data to override defaults.
 * @returns {Promise<Game>} The created game document.
 */
module.exports.createTestGame = async (customData = {}) => {
  const gameData = createGame(customData);
  return await Game.create(gameData);
};

/**
 * Find pools created by a specific user.
 * @param {mongoose.Types.ObjectId} userId - The user ID to search for.
 * @returns {Promise<Pool[]>} An array of pool documents.
 */
module.exports.findPoolsByCreator = async (userId) => {
  return await Pool.find({ creator: userId });
};

/**
 * Find entries for a specific user in a specific pool.
 * @param {mongoose.Types.ObjectId} userId - The user ID to search for.
 * @param {mongoose.Types.ObjectId} poolId - The pool ID to search in.
 * @returns {Promise<Entry[]>} An array of entry documents.
 */
module.exports.findEntriesByUserAndPool = async (userId, poolId) => {
  return await Entry.find({ user: userId, pool: poolId });
};

/**
 * Find picks for a specific entry.
 * @param {mongoose.Types.ObjectId} entryId - The entry ID to search for.
 * @returns {Promise<Pick[]>} An array of pick documents.
 */
module.exports.findPicksByEntry = async (entryId) => {
  return await Pick.find({ entry: entryId });
};

/**
 * Find games for a specific week and season.
 * @param {number} week - The week number to search for.
 * @param {number} season - The season year to search for.
 * @returns {Promise<Game[]>} An array of game documents.
 */
module.exports.findGamesByWeekAndSeason = async (week, season) => {
  return await Game.find({
    'schedule.week': week,
    'schedule.season_year': season
  });
};

/**
 * Update a pool document.
 * @param {mongoose.Types.ObjectId} poolId - The pool ID to update.
 * @param {Object} updateData - The data to update.
 * @returns {Promise<Pool>} The updated pool document.
 */
module.exports.updatePool = async (poolId, updateData) => {
  return await Pool.findByIdAndUpdate(poolId, updateData, { new: true });
};

/**
 * Update an entry document.
 * @param {mongoose.Types.ObjectId} entryId - The entry ID to update.
 * @param {Object} updateData - The data to update.
 * @returns {Promise<Entry>} The updated entry document.
 */
module.exports.updateEntry = async (entryId, updateData) => {
  return await Entry.findByIdAndUpdate(entryId, updateData, { new: true });
};

/**
 * Update a pick document.
 * @param {mongoose.Types.ObjectId} pickId - The pick ID to update.
 * @param {Object} updateData - The data to update.
 * @returns {Promise<Pick>} The updated pick document.
 */
module.exports.updatePick = async (pickId, updateData) => {
  return await Pick.findByIdAndUpdate(pickId, updateData, { new: true });
};

/**
 * Update a game document.
 * @param {string} eventId - The event ID to update.
 * @param {Object} updateData - The data to update.
 * @returns {Promise<Game>} The updated game document.
 */
module.exports.updateGame = async (eventId, updateData) => {
  return await Game.findOneAndUpdate({ event_id: eventId }, updateData, { new: true });
};

/**
 * Generate a valid MongoDB ObjectId.
 * @returns {mongoose.Types.ObjectId} A new ObjectId.
 */
module.exports.generateObjectId = createObjectId;

/**
 * Create a JWT token for a user.
 * @param {User} user - The user document.
 * @returns {string} The JWT token.
 */
module.exports.generateUserToken = (user) => {
  return user.getSignedJwtToken();
};

/**
 * Verify a user's password.
 * @param {User} user - The user document.
 * @param {string} password - The password to verify.
 * @returns {Promise<boolean>} Whether the password is correct.
 */
module.exports.verifyUserPassword = async (user, password) => {
  return await user.matchPassword(password);
};

/**
 * Update a user document.
 * @param {mongoose.Types.ObjectId} userId - The user ID to update.
 * @param {Object} updateData - The data to update.
 * @returns {Promise<User>} The updated user document.
 */
module.exports.updateUser = async (userId, updateData) => {
  return await User.findByIdAndUpdate(userId, updateData, { new: true });
};

/**
 * Update a request document.
 * @param {mongoose.Types.ObjectId} requestId - The request ID to update.
 * @param {Object} updateData - The data to update.
 * @returns {Promise<Request>} The updated request document.
 */
module.exports.updateRequest = async (requestId, updateData) => {
  return await Request.findByIdAndUpdate(requestId, updateData, { new: true });
};

/**
 * Find a user by email.
 * @param {string} email - The email to search for.
 * @returns {Promise<User>} The found user document.
 */
module.exports.findUserByEmail = async (email) => {
  return await User.findOne({ email });
};

/**
 * Find requests for a specific user.
 * @param {mongoose.Types.ObjectId} userId - The user ID to search for.
 * @returns {Promise<Request[]>} An array of request documents.
 */
module.exports.findRequestsByUser = async (userId) => {
  return await Request.find({ user: userId });
};