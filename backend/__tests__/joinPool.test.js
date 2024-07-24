// backend/__tests__/joinPool.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const { app, connectDB } = require('../server');
const User = require('../models/User');
const Entry = require('../models/Entry');
const Pool = require('../models/Pool');
const Game = require('../models/Game');
const Request = require('../models/Request');

beforeAll(async () => {
  await connectDB();
});

beforeEach(async () => {
  await Entry.deleteMany({});
  await User.deleteMany({});
  await Pool.deleteMany({});
  await Game.deleteMany({});
  await Request.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Entries Endpoints', () => {
  let user, admin, pool, entry, userToken, adminToken, newUser, newPool, newUserToken;

  beforeEach(async () => {
    // Create a regular user
    user = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    });
    userToken = user.getSignedJwtToken();

    // Create an admin user
    admin = await User.create({
      username: 'adminuser',
      email: 'admin@example.com',
      password: 'adminpass123',
      role: 'admin'
    });
    adminToken = admin.getSignedJwtToken();

    // Create a pool
    pool = await Pool.create({
      name: 'Test Pool',
      season: 2023,
      maxParticipants: 10,
      entryFee: 50,
      prizeAmount: 450,
      creator: user._id
    });

    // Create an entry
    entry = await Entry.create({
      user: user._id,
      pool: pool._id,
      isActive: true
    });

    // Create a new user and pool for the test
    newUser = await User.create({
      username: 'newuser',
      email: 'new@example.com',
      password: 'password123'
    });
    newUserToken = newUser.getSignedJwtToken();

    newPool = await Pool.create({
      name: 'New Pool',
      season: 2023,
      maxParticipants: 10,
      entryFee: 50,
      prizeAmount: 450,
      creator: newUser._id
    });

    // Create an approved request to join the pool
    await Request.create({
      pool: newPool._id,
      user: newUser._id,
      status: 'approved'
    });
  });

  describe('GET /api/v1/pools/:poolId/entries', () => {
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
        username: 'anotheruser',
        email: 'another@example.com',
        password: 'password123'
      });
      const anotherToken = anotherUser.getSignedJwtToken();

      const res = await request(app)
        .get(`/api/v1/entries/${entry._id}`)
        .set('Authorization', `Bearer ${anotherToken}`);

      expect(res.statusCode).toEqual(401);
    });
  });

  describe('POST /api/v1/pools/:poolId/entries', () => {
    it('should create a new entry with an approved request', async () => {
      const res = await request(app)
        .post(`/api/v1/pools/${newPool._id}/entries`)
        .set('Authorization', `Bearer ${newUserToken}`)
        .send({
          user: newUser._id,
          pool: newPool._id
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body.data).toHaveProperty('user', newUser._id.toString());
      expect(res.body.data).toHaveProperty('pool', newPool._id.toString());
    });

    it('should not create a new entry without an approved request', async () => {
      // Remove the approved request
      await Request.updateOne({ user: newUser._id, pool: newPool._id }, { status: 'pending' });

      const res = await request(app)
        .post(`/api/v1/pools/${newPool._id}/entries`)
        .set('Authorization', `Bearer ${newUserToken}`)
        .send({
          user: newUser._id,
          pool: newPool._id
        });

      expect(res.statusCode).toEqual(403);
    });
  });

  describe('PUT /api/v1/entries/:id', () => {
    it('should update an entry', async () => {
      const game = await Game.create({
        event_id: 'test-event-id',
        event_uuid: 'test-event-uuid',
        sport_id: 2,
        event_date: new Date(Date.now() + 86400000).toISOString(), // Set event_date to tomorrow
        rotation_number_away: 101,
        rotation_number_home: 102,
        teams_normalized: [
          {
            team_id: 1,
            name: 'Team A',
            is_away: true,
            is_home: false
          },
          {
            team_id: 2,
            name: 'Team B',
            is_away: false,
            is_home: true
          }
        ],
        schedule: {
          season_year: 2023,
          week: 1
        }
      });

      const res = await request(app)
        .put(`/api/v1/entries/${entry._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          isActive: false,
          eliminatedWeek: 5,
          gameId: game._id // Include gameId in the request body
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body.data).toHaveProperty('isActive', false);
      expect(res.body.data).toHaveProperty('eliminatedWeek', 5);
    });
  });

  describe('DELETE /api/v1/entries/:id', () => {
    it('should delete an entry', async () => {
      const res = await request(app)
        .delete(`/api/v1/entries/${entry._id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('success', true);

      // Verify the entry is deleted
      const deletedEntry = await Entry.findById(entry._id);
      expect(deletedEntry).toBeNull();
    });

    it('should allow admin to delete any entry', async () => {
      const res = await request(app)
        .delete(`/api/v1/entries/${entry._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('success', true);
    });
  });

  describe('POST /api/v1/requests', () => {
    it('should create a new request to join a pool', async () => {
      const res = await request(app)
        .post('/api/v1/requests')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          poolId: pool._id
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body.data).toHaveProperty('user', user._id.toString());
      expect(res.body.data).toHaveProperty('pool', pool._id.toString());
      expect(res.body.data).toHaveProperty('status', 'pending');
    });
  });

  describe('PUT /api/v1/requests/:id/approve', () => {
    let requestEntry;

    beforeEach(async () => {
      requestEntry = await Request.create({
        user: user._id,
        pool: pool._id,
        status: 'pending'
      });
    });

    it('should approve a request to join a pool', async () => {
      const res = await request(app)
        .put(`/api/v1/requests/${requestEntry._id}/approve`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body.data).toHaveProperty('status', 'approved');
    });

    it('should not allow non-admin users to approve a request', async () => {
      const res = await request(app)
        .put(`/api/v1/requests/${requestEntry._id}/approve`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toEqual(403);
    });
  });
 // Add a new describe block for the full join pool process
 describe('Full Join Pool Process', () => {
  it('should allow user to request entry and admin to approve', async () => {
    // Step 1: User requests entry
    const requestRes = await request(app)
      .post('/api/v1/requests')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ poolId: pool._id });

    expect(requestRes.statusCode).toEqual(201);
    expect(requestRes.body).toHaveProperty('success', true);
    expect(requestRes.body.data).toHaveProperty('status', 'pending');

    const requestId = requestRes.body.data._id;

    // Step 2: Admin approves request
    const approveRes = await request(app)
      .put(`/api/v1/requests/${requestId}/approve`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send();

    expect(approveRes.statusCode).toEqual(200);
    expect(approveRes.body).toHaveProperty('success', true);
    expect(approveRes.body.data).toHaveProperty('status', 'approved');

    // Step 3: Verify entry is created
    const entriesRes = await request(app)
      .get(`/api/v1/pools/${pool._id}/entries`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(entriesRes.statusCode).toEqual(200);
    expect(entriesRes.body).toHaveProperty('success', true);
    expect(entriesRes.body.data.some(entry => entry.user.toString() === user._id.toString())).toBeTruthy();
  });
});
});
