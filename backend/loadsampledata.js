const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const User = require('./models/User');
const Pool = require('./models/Pool');
const Game = require('./models/Game');
const NFLTeam = require('./models/NFLTeam');
const Pick = require('./models/Pick');
const Player = require('./models/Player');
const UserPoolStats = require('./models/UserPoolStats');
const Blacklist = require('./models/Blacklist');
const Market = require('./models/Market');
const Settings = require('./models/Settings');

// MongoDB Atlas connection string
const mongoURI = 'mongodb+srv://allxdamnday:sI85W7QWxO0nbAcv@fbecluster.ofyzkcz.mongodb.net/?retryWrites=true&w=majority&appName=fbecluster';

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', async () => {
  console.log('Connected to MongoDB Atlas');

  try {
    // Clear existing data
    await User.deleteMany({});
    await Pool.deleteMany({});
    await Game.deleteMany({});
    await NFLTeam.deleteMany({});
    await Pick.deleteMany({});
    await Player.deleteMany({});
    await UserPoolStats.deleteMany({});
    await Blacklist.deleteMany({});
    await Market.deleteMany({});
    await Settings.deleteMany({});

    // Insert sample users
    const user = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
    });

    // Insert sample pool
    const pool = await Pool.create({
      name: 'Test Pool',
      season: 2023,
      maxParticipants: 10,
      entryFee: 50,
      prizeAmount: 450,
      creator: user._id,
    });

    // Insert sample NFL teams
    const homeTeam = await NFLTeam.create({
      team_id: 1,
      name: 'Home Team',
      mascot: 'Home Mascot',
      abbreviation: 'HTM',
      record: '0-0',
      conference: {
        conference_id: 1,
        name: 'Conference 1',
      },
      division: {
        division_id: 1,
        name: 'Division 1',
      },
    });

    const awayTeam = await NFLTeam.create({
      team_id: 2,
      name: 'Away Team',
      mascot: 'Away Mascot',
      abbreviation: 'ATM',
      record: '0-0',
      conference: {
        conference_id: 1,
        name: 'Conference 1',
      },
      division: {
        division_id: 1,
        name: 'Division 1',
      },
    });

    // Insert sample game
    const game = await Game.create({
      event_id: 'test123',
      event_uuid: uuidv4(),
      sport_id: 2,
      event_date: new Date(),
      rotation_number_away: 101,
      rotation_number_home: 102,
      teams_normalized: [
        {
          team_id: awayTeam.team_id,
          name: awayTeam.name,
          mascot: awayTeam.mascot,
          abbreviation: awayTeam.abbreviation,
          conference_id: awayTeam.conference.conference_id,
          division_id: awayTeam.division.division_id,
          is_away: true,
          is_home: false,
        },
        {
          team_id: homeTeam.team_id,
          name: homeTeam.name,
          mascot: homeTeam.mascot,
          abbreviation: homeTeam.abbreviation,
          conference_id: homeTeam.conference.conference_id,
          division_id: homeTeam.division.division_id,
          is_away: false,
          is_home: true,
        },
      ],
      schedule: {
        league_name: 'NFL',
        conference_competition: true,
        season_type: 'Regular',
        season_year: 2023,
        week: 1,
        week_name: 'Week 1',
        week_detail: 'First week of the season',
        event_name: 'Home Team vs Away Team',
        attendance: '50000',
      },
    });

    // Insert sample pick
    const pick = await Pick.create({
      user: user._id,
      pool: pool._id,
      weekNumber: 1,
      team: homeTeam.name,
      game: game._id,
    });

    // Insert sample player
    const player = await Player.create({
      firstName: 'John',
      lastName: 'Doe',
      displayName: 'John Doe',
      team: homeTeam._id,
      position: 'Quarterback',
      jerseyNumber: 12,
      rundownId: 'player123',
      active: true,
      status: 'Active',
    });

    // Insert sample user pool stats
    const userPoolStats = await UserPoolStats.create({
      user: user._id,
      pool: pool._id,
      status: 'active',
      eliminationWeek: null,
      lastPickedWeek: 1,
      pickedTeams: [homeTeam._id],
    });

    // Insert sample blacklist token
    const blacklist = await Blacklist.create({
      token: 'sampletoken123',
    });

    // Insert sample market
    const market = await Market.create({
      rundownId: 1,
      name: 'Market 1',
      description: 'Sample market description',
      lineValueIsParticipant: false,
      proposition: false,
      periodId: 0,
      updatedAt: new Date(),
    });

    // Insert sample settings
    const settings = await Settings.create({
      key: 'sampleKey',
      value: 'sampleValue',
    });

    console.log('Sample data loaded successfully');
  } catch (error) {
    console.error('Error loading sample data:', error);
  } finally {
    mongoose.connection.close();
  }
});