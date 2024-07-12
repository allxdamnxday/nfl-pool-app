//games.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const { app, connectDB } = require('../server');
const Game = require('../models/Game');
const NFLTeam = require('../models/NFLTeam');
const User = require('../models/User');
const rundownApi = require('../services/rundownApiService');


// Mock the entire rundownApiService module
jest.mock('../services/rundownApiService');

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

describe('POST /api/v1/games/fetch', () => {
  it('should fetch and store games from external API', async () => {
    const res = await request(app)
      .post('/api/v1/games/fetch')
      .set('Authorization', `Bearer ${token}`)
      .send({ date: '2024-08-10', limit: 5 });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('count');
    expect(res.body.count).toBeGreaterThan(0);
    expect(res.body).toHaveProperty('message');
  });

  it('should return 400 if date is not provided', async () => {
    const res = await request(app)
      .post('/api/v1/games/fetch')
      .set('Authorization', `Bearer ${token}`)
      .send({});

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('success', false);
    expect(res.body).toHaveProperty('error', 'Please provide a date');
  });

  it('should handle case when no games are found', async () => {
    // Mock the rundownApi.fetchNFLSchedule to return an empty array
    jest.spyOn(rundownApi, 'fetchNFLSchedule').mockResolvedValue([]);
  
    const res = await request(app)
      .post('/api/v1/games/fetch')
      .set('Authorization', `Bearer ${token}`)
      .send({ date: '2024-07-01' });  // Use an off-season date
  
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('count', 0);
    expect(res.body).toHaveProperty('message', 'No games found for the given date.');
  
    // Restore the original implementation
    jest.restoreAllMocks();
  });
});


describe('Game Routes', () => {
  describe('GET /api/v1/games', () => {
    it('should return all games', async () => {
      const res = await request(app)
        .get('/api/v1/games')
        .set('Authorization', `Bearer ${token}`);
    
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('success', true);
      expect(Array.isArray(res.body.data)).toBeTruthy();
      // Optional: Check length if you know there should be games in the database
      // expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('should return games sorted by date', async () => {
      const res = await request(app)
        .get('/api/v1/games')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      const games = res.body.data;
      for (let i = 1; i < games.length; i++) {
        expect(new Date(games[i].event_date)).toBeGreaterThanOrEqual(new Date(games[i-1].event_date));
      }
    });
  });

  describe('GET /api/v1/games/:id', () => {
    it('should return a single game', async () => {
      // Ensure there is at least one game in the database
      const game = await Game.findOne();
      
      if (!game) {
        console.log('No games found in the database');
        return;
      }
    
      const res = await request(app)
        .get(`/api/v1/games/${game._id}`) // Use _id to fetch the game
        .set('Authorization', `Bearer ${token}`);
    
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('success', true);
      // Check if the response includes the event_id, matching the one in the database
      expect(res.body.data).toHaveProperty('event_id', game.event_id.toString());
    });

    it('should return 404 if game not found', async () => {
        const fakeId = mongoose.Types.ObjectId();
        const res = await request(app)
          .get(`/api/v1/games/${fakeId}`)
          .set('Authorization', `Bearer ${token}`);
    
        expect(res.statusCode).toEqual(404);
        expect(res.body).toHaveProperty('success', false);
        expect(res.body).toHaveProperty('error', `Game not found with id of ${fakeId}`);
      });
    });

    describe('GET /api/v1/games/filter', () => {
      it('should return games filtered by season', async () => {
        const res = await request(app)
          .get('/api/v1/games/filter')
          .query({ season: 2024 })
          .set('Authorization', `Bearer ${token}`);
    
        expect(res.statusCode).toEqual(200);
        expect(res.body.data.every(game => game.schedule.season_year === 2024)).toBeTruthy();
      });
    
      it('should return games filtered by week', async () => {
        const res = await request(app)
          .get('/api/v1/games/filter')
          .query({ week: 1 })
          .set('Authorization', `Bearer ${token}`);
    
        expect(res.statusCode).toEqual(200);
        expect(res.body.data.every(game => game.schedule.week === 1)).toBeTruthy();
      });
    });

  describe('GET /api/v1/games/team/:teamId', () => {
    it('should return games for a specific team', async () => {
      // Ensure there is at least one team in the database
      const team = await NFLTeam.findOne();
    
      if (!team) {
        console.log('No teams found in the database');
        return;
      }
    
      const res = await request(app)
        .get(`/api/v1/games/team/${team.team_id}`)
        .set('Authorization', `Bearer ${token}`);
    
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('success', true);
      expect(Array.isArray(res.body.data)).toBeTruthy();
      // Optional: Add more specific checks if you have expected data
      // expect(res.body.data.length).toBeGreaterThan(0);
    });
  });
});


describe('PUT /api/v1/games/:id/status', () => {
  it('should update game status', async () => {
    // Create a valid game first
    const game = await Game.create({
      event_id: 'test123',
      event_uuid: 'test-uuid',
      sport_id: 2,
      event_date: new Date(),
      score: { event_status: 'STATUS_SCHEDULED' },
      teams_normalized: [
        { team_id: 1, name: 'Team A', is_away: true, is_home: false },
        { team_id: 2, name: 'Team B', is_away: false, is_home: true }
      ],
      schedule: {
        season_year: 2024,
        week: 1
      }
    });

    const res = await request(app)
      .put(`/api/v1/games/${game._id}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'STATUS_FINAL' });

    expect(res.statusCode).toEqual(200);
    expect(res.body.data.score.event_status).toEqual('STATUS_FINAL');
  });
});