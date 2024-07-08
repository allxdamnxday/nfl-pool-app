// backend/__tests__/pools.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const { app, connectDB } = require('../server');
const User = require('../models/User');
const Pool = require('../models/Pool');

let token;
let createdPoolId;

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
    expect(res.body).toHaveProperty('success', true);
    expect(res.body.data).toHaveProperty('name', 'Test Pool');
    
    createdPoolId = res.body.data._id;
  });

  it('should get all pools', async () => {
    const res = await request(app)
      .get('/api/v1/pools')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('success', true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('should get a single pool', async () => {
    const res = await request(app)
      .get(`/api/v1/pools/${createdPoolId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body.data).toHaveProperty('name', 'Test Pool');
  });

  it('should join a pool', async () => {
    const res = await request(app)
      .post(`/api/v1/pools/${createdPoolId}/join`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body.data.participants).toHaveLength(1);
  });

  it('should update a pool', async () => {
    const res = await request(app)
      .put(`/api/v1/pools/${createdPoolId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Updated Test Pool',
        maxParticipants: 15
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body.data).toHaveProperty('name', 'Updated Test Pool');
    expect(res.body.data).toHaveProperty('maxParticipants', 15);
  });

  it('should delete a pool', async () => {
    const res = await request(app)
      .delete(`/api/v1/pools/${createdPoolId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body.data).toEqual({});

    // Verify the pool is deleted
    const checkRes = await request(app)
      .get(`/api/v1/pools/${createdPoolId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(checkRes.statusCode).toEqual(404);
  });
});._id;

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
