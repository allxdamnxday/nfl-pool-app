// __tests__/integration/gameIntegration.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const { app, connectDB } = require('../../server');
const Game = require('../../models/Game');
const User = require('../../models/User');

let token;

beforeAll(async () => {
  await connectDB();
  const user = await User.create({
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123'
  });
  token = user.getSignedJwtToken();
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Game API', () => {
  it('should fetch and store games', async () => {
    const res = await request(app)
      .post('/api/v1/games/fetch')
      .set('Authorization', `Bearer ${token}`)
      .send({ date: '2024-09-20', limit: 5 });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('count');
    expect(res.body.count).toBeGreaterThan(0);
  });

  it('should get all games', async () => {
    const res = await request(app)
      .get('/api/v1/games')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(Array.isArray(res.body.data)).toBeTruthy();
  });

  // Add more integration tests for other endpoints...
});