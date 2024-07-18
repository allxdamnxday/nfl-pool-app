// backend/__tests__/entries.test.js
const request = require('supertest');
const { app } = require('../server');
const User = require('../models/User');
const Entry = require('../models/Entry');
const Pool = require('../models/Pool');
const Game = require('../models/Game');
const { connectDB, closeDatabase, clearDatabase } = require('../helpers/dbHelpers');
const { generateToken, generateAdminToken } = require('../helpers/authHelpers');
const { mockUser, mockAdmin, mockPool, mockEntry, mockGame } = require('../__mocks__/mockEntry');

beforeAll(async () => await connectDB());
afterEach(async () => await clearDatabase());
afterAll(async () => await closeDatabase());

describe('Entries Endpoints', () => {
  let user, admin, pool, entry, userToken, adminToken;

  beforeEach(async () => {
    user = await User.create(mockUser);
    userToken = generateToken(user);

    admin = await User.create(mockAdmin);
    adminToken = generateAdminToken(admin);

    pool = await Pool.create({ ...mockPool, creator: user._id });
    entry = await Entry.create({ ...mockEntry, user: user._id, pool: pool._id });
  });

  describe('GET /api/v1/entries', () => {
    it('should get all entries for a pool', async () => {
      const res = await request(app)
        .get(`/api/v1/pools/${pool._id}/entries`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('success', true);
      expect(Array.isArray(res.body.data)).toBeTruthy();
    });
  });

  describe('GET /api/v1/entries/:id', () => {
    it('should get a single entry', async () => {
      const res = await request(app)
        .get(`/api/v1/entries/${entry._id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body.data).toHaveProperty('_id', entry._id.toString());
    });

    it('should not allow access to entry by another user', async () => {
      const anotherUser = await User.create({
        ...mockUser,
        username: 'anotheruser',
        email: 'another@example.com'
      });
      const anotherToken = generateToken(anotherUser);

      const res = await request(app)
        .get(`/api/v1/entries/${entry._id}`)
        .set('Authorization', `Bearer ${anotherToken}`);

      expect(res.statusCode).toEqual(401);
    });
  });

  describe('POST /api/v1/entries/:poolId/request-entry', () => {
    it('should request entry to a pool', async () => {
      const newUser = await User.create({
        ...mockUser,
        username: 'newuser2',
        email: 'new2@example.com'
      });
      const newUserToken = generateToken(newUser);
      
      const res = await request(app)
        .post(`/api/v1/entries/${pool._id}/request-entry`)
        .set('Authorization', `Bearer ${newUserToken}`)
        .send();
  
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('user', newUser._id.toString());
      expect(res.body.data).toHaveProperty('pool', pool._id.toString());
      expect(res.body.data).toHaveProperty('isActive', false);
    });
  
    it('should not request entry if user already has an entry', async () => {
      const res = await request(app)
        .post(`/api/v1/entries/${pool._id}/request-entry`)
        .set('Authorization', `Bearer ${userToken}`)
        .send();
  
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('User already requested or has an entry in this pool');
    });
  });

  // Update the 'should create a new entry' test
  it('should create a new entry', async () => {
    const newUser = await User.create({
      ...mockUser,
      username: 'newuser',
      email: 'new@example.com'
    });
    const newUserToken = generateToken(newUser);
  
    const newPool = await Pool.create({ ...mockPool, creator: newUser._id });
  
    // Step 1: Request to join the pool
    const requestRes = await request(app)
      .post(`/api/v1/entries/${newPool._id}/request-entry`)
      .set('Authorization', `Bearer ${newUserToken}`)
      .send();
  
    expect(requestRes.status).toBe(201);
    expect(requestRes.body).toHaveProperty('success', true);
  
    // Step 2: Approve the request (this should be done by an admin)
    const entryRequest = await Entry.findOne({ user: newUser._id, pool: newPool._id, isActive: false });
    const approveRes = await request(app)
      .put(`/api/v1/entries/${entryRequest._id}/approve`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send();
  
    expect(approveRes.status).toBe(200);
    expect(approveRes.body).toHaveProperty('success', true);
  
    // Step 3: Verify the entry is now active
    const updatedEntry = await Entry.findById(entryRequest._id);
    expect(updatedEntry.isActive).toBe(true);
  });
  

  describe('PUT /api/v1/entries/:id/approve', () => {
    let entryId;

    beforeEach(async () => {
      const newEntry = await Entry.create({
        user: user._id,
        pool: pool._id,
        isActive: false
      });
      entryId = newEntry._id;
    });

    it('should approve entry request', async () => {
      const res = await request(app)
        .put(`/api/v1/entries/${entryId}/approve`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send();

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('isActive', true);
    });

    it('should not approve entry request if not admin', async () => {
      const res = await request(app)
        .put(`/api/v1/entries/${entryId}/approve`)
        .set('Authorization', `Bearer ${userToken}`)
        .send();
    
      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('User role user is not authorized to access this route');
    });
  });
});