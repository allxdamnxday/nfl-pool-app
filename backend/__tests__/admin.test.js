// backend/__tests__/admin.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const { app, connectDB } = require('../server');
const User = require('../models/User');
const { generateAdminToken } = require('../utils/testUtils');

beforeAll(async () => {
  await connectDB();
});

beforeEach(async () => {
  await User.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Admin Endpoints', () => {
  let token;

  beforeEach(async () => {
    const admin = await User.create({
      username: 'adminuser',
      email: 'admin@example.com',
      password: 'password123',
      role: 'admin'
    });
    token = generateAdminToken(admin);
  });

  it('should get all users', async () => {
    const res = await request(app)
      .get('/api/v1/admin/users')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body.data).toBeInstanceOf(Array);
  });

  it('should get a single user', async () => {
    const user = await User.create({
      username: 'testuser',
      email: 'testuser@example.com',
      password: 'password123'
    });

    const res = await request(app)
      .get(`/api/v1/admin/users/${user._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body.data).toHaveProperty('username', 'testuser');
  });

  it('should update a user', async () => {
    const user = await User.create({
      username: 'testuser',
      email: 'testuser@example.com',
      password: 'password123'
    });

    const res = await request(app)
      .put(`/api/v1/admin/users/${user._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        username: 'updateduser'
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body.data).toHaveProperty('username', 'updateduser');
  });

  it('should delete a user', async () => {
    const user = await User.create({
      username: 'testuser',
      email: 'testuser@example.com',
      password: 'password123'
    });

    const res = await request(app)
      .delete(`/api/v1/admin/users/${user._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body.data).toEqual({});
  });

  it('should get application statistics', async () => {
    const res = await request(app)
      .get('/api/v1/admin/stats')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body.data).toHaveProperty('usersCount');
  });

  it('should sync rundown data', async () => {
    const res = await request(app)
      .post('/api/v1/admin/sync-rundown')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body.data).toEqual('Data synced successfully');
  });
});
