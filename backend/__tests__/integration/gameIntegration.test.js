// /backend/__tests__/integration/gameIntegration.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const { app, connectDB } = require('../../server');
const Game = require('../../models/Game');
const User = require('../../models/User');
const rundownApi = require('../../services/rundownApiService');

// Mock dependencies
jest.mock('../../models/Game');
jest.mock('../../services/rundownApiService');

let token;

beforeAll(async () => {
  await connectDB();
  
  // Ensure the User model is clean before testing
  await User.deleteMany({});
  
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

describe('Games Endpoints', () => {
  it('should fetch games from external API and store in database', async () => {
    rundownApi.fetchNFLSchedule.mockResolvedValue([
      { event_id: 'test1', event_date: '2024-09-20T00:00:00Z' }
    ]);

    Game.findOneAndUpdate.mockResolvedValue({});

    const res = await request(app)
      .post('/api/v1/games/fetch')
      .set('Authorization', `Bearer ${token}`)
      .send({ date: '2024-09-20', limit: 5 });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('count', 1);
  });

  it('should fail to fetch games with invalid date', async () => {
    const res = await request(app)
      .post('/api/v1/games/fetch')
      .set('Authorization', `Bearer ${token}`)
      .send({ date: 'invalid-date' });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('success', false);
  });

  it('should not create duplicate games', async () => {
    rundownApi.fetchNFLSchedule.mockResolvedValue([
      { event_id: 'test1', event_date: '2024-09-20T00:00:00Z' }
    ]);

    Game.findOneAndUpdate.mockResolvedValue({});

    await request(app)
      .post('/api/v1/games/fetch')
      .set('Authorization', `Bearer ${token}`)
      .send({ date: '2024-09-20', limit: 5 });

    const res = await request(app)
      .post('/api/v1/games/fetch')
      .set('Authorization', `Bearer ${token}`)
      .send({ date: '2024-09-20', limit: 5 });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('success', true);
  });

  it('should get all games', async () => {
    const mockSort = jest.fn().mockReturnThis();
    Game.find.mockReturnValue({ sort: mockSort, exec: jest.fn().mockResolvedValue([{ event_id: 'test1', event_date: '2024-09-20T00:00:00Z' }]) });

    const res = await request(app)
      .get('/api/v1/games')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(Array.isArray(res.body.data)).toBeTruthy();
  });

  it('should get a single game by ID', async () => {
    const game = { _id: mongoose.Types.ObjectId(), event_id: '1', event_uuid: 'uuid1', sport_id: 1, event_date: new Date() };
    Game.findById.mockResolvedValue(game);

    const res = await request(app)
      .get(`/api/v1/games/${game._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body.data).toHaveProperty('event_id', '1');
  });

  it('should fail to get a game with non-existent ID', async () => {
    Game.findById.mockResolvedValue(null);

    const res = await request(app)
      .get('/api/v1/games/invalidID')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(404);
    expect(res.body).toHaveProperty('success', false);
  });

  it('should get games for a specific week and season', async () => {
    const mockSort = jest.fn().mockReturnThis();
    Game.find.mockReturnValue({ sort: mockSort, exec: jest.fn().mockResolvedValue([{ event_id: 'test1', event_date: '2024-09-20T00:00:00Z' }]) });

    const res = await request(app)
      .get('/api/v1/games/week/2024/1')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('success', true);
  });

  it('should fail to get games with invalid season/week combination', async () => {
    const res = await request(app)
      .get('/api/v1/games/week/invalid/invalid')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('success', false);
  });

  it('should update game status as admin', async () => {
    const game = { _id: mongoose.Types.ObjectId(), event_id: '1', event_uuid: 'uuid1', sport_id: 1, event_date: new Date() };
    Game.findByIdAndUpdate.mockResolvedValue(game);

    const res = await request(app)
      .put(`/api/v1/games/${game._id}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'completed' });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('success', true);
  });

  it('should fail to update game status as non-admin', async () => {
    const game = { _id: mongoose.Types.ObjectId(), event_id: '1', event_uuid: 'uuid1', sport_id: 1, event_date: new Date() };
    Game.findByIdAndUpdate.mockResolvedValue(null);

    const res = await request(app)
      .put(`/api/v1/games/${game._id}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'completed' });

    expect(res.statusCode).toEqual(403);
    expect(res.body).toHaveProperty('success', false);
  });

  it('should fail to update game status with invalid status', async () => {
    const game = { _id: mongoose.Types.ObjectId(), event_id: '1', event_uuid: 'uuid1', sport_id: 1, event_date: new Date() };
    Game.findByIdAndUpdate.mockResolvedValue(null);

    const res = await request(app)
      .put(`/api/v1/games/${game._id}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'invalid-status' });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('success', false);
  });

  it('should get games for a specific team', async () => {
    const team = { team_id: 1, name: 'Team A', abbreviation: 'TA', mascot: 'Mascot A' };
    await NFLTeam.create(team);
    const mockSort = jest.fn().mockReturnThis();
    Game.find.mockReturnValue({ sort: mockSort, exec: jest.fn().mockResolvedValue([{ event_id: 'test1', event_date: '2024-09-20T00:00:00Z' }]) });

    const res = await request(app)
      .get(`/api/v1/games/team/${team.team_id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('success', true);
  });
});