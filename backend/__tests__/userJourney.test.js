// __tests__/userJourney.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const { app } = require('../server');
const User = require('../models/User');
const Pool = require('../models/Pool');
const Request = require('../models/Request');
const Entry = require('../models/Entry');
const { mockUser, mockAdminUser } = require('../__mocks__/mockUser');
const { generateToken, generateAdminToken } = require('../helpers/authHelpers');
const { connectDB, closeDatabase, clearDatabase } = require('../helpers/dbHelpers');

beforeAll(async () => {
  await connectDB();
});

afterAll(async () => {
  await closeDatabase();
});

describe('User Journey', () => {
  let user, admin, pool, userToken, adminToken;

  beforeEach(async () => {
    await clearDatabase();

    user = await User.create(mockUser);
    userToken = generateToken(user);

    admin = await User.create(mockAdminUser);
    adminToken = generateAdminToken(admin);

    pool = await Pool.create({
      name: '2024 NFL Pool',
      season: 2024,
      maxParticipants: 100,
      entryFee: 50,
      prizeAmount: 4500,
      creator: admin._id
    });
  });

  describe('GET /api/v1/pools', () => {
    it('should allow user to browse available pools', async () => {
      const res = await request(app)
        .get('/api/v1/pools')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].name).toBe('2024 NFL Pool');
    });
  });

  describe('POST /api/v1/requests', () => {
    it('should allow user to request to join a pool', async () => {
      const res = await request(app)
        .post('/api/v1/requests')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ poolId: pool._id, numberOfEntries: 2 });

      expect(res.statusCode).toBe(201);
      expect(res.body.data.status).toBe('pending');
      expect(res.body.data.numberOfEntries).toBe(2);
    });
  });

  describe('PUT /api/v1/requests/:id/approve', () => {
    it('should allow admin to approve the request', async () => {
      const requestEntry = await Request.create({
        pool: pool._id,
        user: user._id,
        numberOfEntries: 2,
        status: 'pending'
      });

      const res = await request(app)
        .put(`/api/v1/requests/${requestEntry._id}/approve`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.request.status).toBe('approved');
      expect(res.body.data.entries.length).toBe(2);
    });
  });

  describe('GET /api/v1/pools/user/:userId/active', () => {
    it('should allow user to view their active pool after approval', async () => {
      await Entry.create({
        user: user._id,
        pool: pool._id,
        isActive: true
      });

      const res = await request(app)
        .get(`/api/v1/pools/user/${user._id}/active`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0]._id).toBe(pool._id.toString());
    });
  });
});