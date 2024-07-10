// backend/__tests__/pools.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const { app, connectDB } = require('../server');
const User = require('../models/User');
const Pool = require('../models/Pool');

let token;

beforeAll(async () => {
  await connectDB();
  
  // Create a user and get token for authenticated requests
  const res = await request(app)
    .post('/api/v1/auth/register')
    .send({
      username: 'pooluser',
      email: 'pool@example.com',
      password: 'password123'
    });
  
  token = res.body.token;
});

afterAll(async () => {
  await mongoose.connection.close();
});

beforeEach(async () => {
  await Pool.deleteMany({});
});

describe('Pool Endpoints', () => {
  it('should join a pool', async () => {
    // First, create a pool
    const createRes = await request(app)
      .post('/api/v1/pools')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Test Pool',
        season: 2023,
        maxParticipants: 10,
        entryFee: 50,
        prizeAmount: 450
      });

    console.log('Create Pool Response:', createRes.body);  // Log response body
  
    expect(createRes.statusCode).toEqual(201);
    expect(createRes.body).toHaveProperty('data');
    const poolId = createRes.body.data._id;
  
    // Then, join the pool
    const res = await request(app)
      .post(`/api/v1/pools/${poolId}/join`)
      .set('Authorization', `Bearer ${token}`);
  
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body.data.participants).toHaveLength(1);
  });

  it('should get all pools', async () => {
    // First, create a pool
    const createRes = await request(app)
      .post('/api/v1/pools')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Test Pool',
        season: 2023,
        maxParticipants: 10,
        entryFee: 50,
        prizeAmount: 450
      });

    console.log('Create Pool Response:', createRes.body);  // Log response body

    if (createRes.statusCode !== 201) {
      console.error('Failed to create pool:', createRes.body);
    }

    expect(createRes.statusCode).toEqual(201);
    expect(createRes.body).toHaveProperty('data');

    // Then, get all pools
    const res = await request(app)
      .get('/api/v1/pools')
      .set('Authorization', `Bearer ${token}`);

    console.log('Get All Pools Response:', res.body);  // Log response body

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('success', true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('should get a single pool', async () => {
    // First, create a pool
    const createRes = await request(app)
      .post('/api/v1/pools')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Test Pool',
        season: 2023,
        maxParticipants: 10,
        entryFee: 50,
        prizeAmount: 450
      });

    console.log('Create Pool Response:', createRes.body);  // Log response body

    if (createRes.statusCode !== 201) {
      console.error('Failed to create pool:', createRes.body);
    }

    expect(createRes.statusCode).toEqual(201);
    expect(createRes.body).toHaveProperty('data');
    const poolId = createRes.body.data._id;

    // Then, get the pool by ID
    const res = await request(app)
      .get(`/api/v1/pools/${poolId}`)
      .set('Authorization', `Bearer ${token}`);

    console.log('Get Single Pool Response:', res.body);  // Log response body

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body.data).toHaveProperty('name', 'Test Pool');
  });
});
