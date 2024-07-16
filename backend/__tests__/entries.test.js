const request = require('supertest');
const mongoose = require('mongoose');
const { app, connectDB } = require('../server');
const User = require('../models/User');
const Entry = require('../models/Entry');
const Pool = require('../models/Pool');
const Game = require('../models/Game'); // Import the Game model

let server;

// Ensure the database is connected before running tests
beforeAll(async () => {
  await connectDB();
});

// Ensure the database is clean before each test
beforeEach(async () => {
  await Entry.deleteMany({});
  await User.deleteMany({});
  await Pool.deleteMany({});
  await Game.deleteMany({}); // Clean up the Game collection
});

// Close the database connection after all tests
afterAll(async () => {
  await mongoose.connection.close();
});

describe('Entries Endpoints', () => {
  let user, admin, pool, entry, userToken, adminToken;

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
    let newUser, newPool, newUserToken;

    beforeEach(async () => {
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
    });

    it('should create a new entry', async () => {
      // Ensure the user and pool are created
      const createdUser = await User.findById(newUser._id);
      const createdPool = await Pool.findById(newPool._id);

      expect(createdUser).not.toBeNull();
      expect(createdPool).not.toBeNull();

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
  
      const entry = await Entry.create({
        user: user._id,
        pool: pool._id,
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

  describe('POST /api/v1/pools/:poolId/request-entry', () => {
    it('should request entry to a pool', async () => {
      const res = await request(app)
        .post(`/api/v1/pools/${pool._id}/request-entry`)
        .set('Authorization', `Bearer ${userToken}`)
        .send();

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('user', user._id.toString());
      expect(res.body.data).toHaveProperty('pool', pool._id.toString());
      expect(res.body.data).toHaveProperty('isActive', false);
    });

    it('should not request entry if user already has an entry', async () => {
      const res = await request(app)
        .post(`/api/v1/pools/${pool._id}/request-entry`)
        .set('Authorization', `Bearer ${userToken}`)
        .send();

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('User already requested or has an entry in this pool');
    });
  });

  describe('PUT /api/v1/entries/:id/approve', () => {
    let entryId;

    beforeEach(async () => {
      const entry = await Entry.findOne({ user: user._id, pool: pool._id, isActive: false });
      entryId = entry._id;
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

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe(`User ${user._id} is not authorized to approve this entry`);
    });
  });
});