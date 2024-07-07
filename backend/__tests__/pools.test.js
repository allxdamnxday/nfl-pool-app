const request = require('supertest');
const app = require('../server');
const Pool = require('../models/Pool');
const User = require('../models/User');
const mongoose = require('mongoose');

describe('Pools Endpoints', () => {
  let token;

  beforeEach(async () => {
    await Pool.deleteMany({});
    await User.deleteMany({});

    // Create a user and get token for authenticated requests
    const user = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    });
    token = user.getSignedJwtToken();
  });

  it('should create a new pool', async () => {
    const res = await request(app)
      .post('/api/v1/pools')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Test Pool',
        season: 2023,
        maxParticipants: 10,
        entryFee: 50,
        prizeAmount: 450
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body.data).toHaveProperty('name', 'Test Pool');
  });

  it('should get all pools', async () => {
    // First, create a pool
    await Pool.create({
      name: 'Test Pool',
      season: 2023,
      maxParticipants: 10,
      entryFee: 50,
      prizeAmount: 450,
      creator: mongoose.Types.ObjectId()
    });

    const res = await request(app)
      .get('/api/v1/pools')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.data.length).toBeGreaterThan(0);
  });
});