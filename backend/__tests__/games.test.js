const request = require('supertest');
const mongoose = require('mongoose');
const { app, connectDB } = require('../server');
const Game = require('../models/Game');
const NFLTeam = require('../models/NFLTeam');
const User = require('../models/User');

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
