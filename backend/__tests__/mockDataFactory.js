const { faker } = require('@faker-js/faker');
const mongoose = require('mongoose');
const crypto = require('crypto');

// Helper function to create a MongoDB ObjectId
const createObjectId = () => new mongoose.Types.ObjectId();

const createUser = (overrides = {}) => {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  let username = faker.internet.userName({ firstName, lastName });
  username = username.substring(0, 20); // Ensure username is not longer than 20 characters
  const email = faker.internet.email({ firstName, lastName });
  const verificationToken = crypto.randomBytes(20).toString('hex');

  return {
    _id: createObjectId(),
    firstName,
    lastName,
    username,
    email,
    password: faker.internet.password({ length: 10 }),
    role: faker.helpers.arrayElement(['user', 'admin']),
    isEmailVerified: faker.datatype.boolean(),
    verificationToken,
    verificationTokenExpire: faker.date.future(),
    resetPasswordToken: faker.datatype.boolean() ? crypto.randomBytes(20).toString('hex') : undefined,
    resetPasswordExpire: faker.datatype.boolean() ? faker.date.future() : undefined,
    createdAt: faker.date.past(),
    ...overrides
  };
};

const createAdmin = (overrides = {}) => ({
  ...createUser(),
  role: 'admin',
  ...overrides
});

const createRequest = (userId, poolId, overrides = {}) => ({
  _id: createObjectId(),
  user: userId || createObjectId(),
  pool: poolId || createObjectId(),
  numberOfEntries: faker.number.int({ min: 1, max: 3 }),
  status: 'pending',
  totalAmount: faker.number.int({ min: 10, max: 1000 }),
  paymentStatus: 'pending',
  ...overrides
});

const createPool = (creatorId, overrides = {}) => ({
    _id: createObjectId(),
    name: faker.company.name() + ' Pool',
    season: faker.date.future().getFullYear(),
    maxParticipants: faker.number.int({ min: 2, max: 10000 }),
    entryFee: faker.number.int({ min: 1, max: 1000 }),
    prizeAmount: faker.number.int({ min: 100, max: 100000 }),
    creator: creatorId || createObjectId(),
    description: faker.lorem.paragraph(),
    startDate: faker.date.future(),
    endDate: faker.date.future(),
    maxEntries: faker.number.int({ min: 2, max: 30000 }),
    prizePot: faker.number.int({ min: 1000, max: 1000000 }),
    numberOfWeeks: faker.number.int({ min: 1, max: 18 }), // Add this line
    status: 'open', // Add this line
    ...overrides
  });

const createEntry = (userId, poolId, requestId, overrides = {}) => ({
  user: userId,
  pool: poolId,
  request: requestId,
  entryNumber: faker.number.int({ min: 1, max: 3 }),
  status: 'active',
  ...overrides
});

const createPick = (entryId, overrides = {}) => ({
  _id: createObjectId(),
  entry: entryId,
  entryNumber: overrides.entryNumber || faker.number.int({ min: 1, max: 3 }),
  game: overrides.game || createObjectId(),
  week: overrides.week || faker.number.int({ min: 1, max: 18 }),
  team: overrides.team || faker.company.name(),
  result: overrides.result || 'pending',
  ...overrides
});

const createGame = (overrides = {}) => ({
  _id: createObjectId(),
  event_id: faker.string.uuid(),
  event_uuid: faker.string.uuid(),
  sport_id: 2, // NFL sport_id
  event_date: faker.date.future(),
  rotation_number_away: faker.number.int({ min: 100, max: 999 }),
  rotation_number_home: faker.number.int({ min: 100, max: 999 }),
  away_team_id: faker.number.int({ min: 1, max: 32 }),
  home_team_id: faker.number.int({ min: 1, max: 32 }),
  away_team: faker.company.name() + ' ' + faker.animal.type(),
  home_team: faker.company.name() + ' ' + faker.animal.type(),
  total: faker.number.float({ min: 30, max: 60, multipleOf: 0.5 }),
  score: {
    event_status: faker.helpers.arrayElement(['scheduled', 'in_progress', 'final']),
    winner_away: faker.number.int({ min: 0, max: 1 }),
    winner_home: faker.number.int({ min: 0, max: 1 }),
    score_away: faker.number.int({ min: 0, max: 50 }),
    score_home: faker.number.int({ min: 0, max: 50 }),
    score_away_by_period: Array.from({ length: 4 }, () => faker.number.int({ min: 0, max: 14 })),
    score_home_by_period: Array.from({ length: 4 }, () => faker.number.int({ min: 0, max: 14 })),
    venue_name: faker.company.name(),
    venue_location: faker.location.city(),
    game_clock: faker.number.int({ min: 0, max: 3600 }),
    display_clock: `${faker.number.int({ min: 0, max: 15 })}:${faker.number.int({ min: 0, max: 59 }).toString().padStart(2, '0')}`,
    game_period: faker.number.int({ min: 1, max: 4 }),
    broadcast: faker.company.name(),
    event_status_detail: faker.lorem.sentence(),
    updated_at: faker.date.recent()
  },
  teams_normalized: [
    {
      team_id: faker.number.int({ min: 1, max: 32 }),
      name: faker.company.name(),
      mascot: faker.animal.type(),
      abbreviation: faker.string.alpha({ length: 3, casing: 'upper' }),
      conference_id: faker.number.int({ min: 1, max: 2 }),
      division_id: faker.number.int({ min: 1, max: 8 }),
      ranking: faker.number.int({ min: 1, max: 32 }),
      record: `${faker.number.int({ min: 0, max: 16 })}-${faker.number.int({ min: 0, max: 16 })}`,
      is_away: true,
      is_home: false,
      conference: {
        conference_id: faker.number.int({ min: 1, max: 2 }),
        sport_id: 2,
        name: faker.helpers.arrayElement(['AFC', 'NFC'])
      },
      division: {
        division_id: faker.number.int({ min: 1, max: 8 }),
        conference_id: faker.number.int({ min: 1, max: 2 }),
        sport_id: 2,
        name: faker.helpers.arrayElement(['North', 'South', 'East', 'West'])
      }
    },
    {
      team_id: faker.number.int({ min: 1, max: 32 }),
      name: faker.company.name(),
      mascot: faker.animal.type(),
      abbreviation: faker.string.alpha({ length: 3, casing: 'upper' }),
      conference_id: faker.number.int({ min: 1, max: 2 }),
      division_id: faker.number.int({ min: 1, max: 8 }),
      ranking: faker.number.int({ min: 1, max: 32 }),
      record: `${faker.number.int({ min: 0, max: 16 })}-${faker.number.int({ min: 0, max: 16 })}`,
      is_away: false,
      is_home: true,
      conference: {
        conference_id: faker.number.int({ min: 1, max: 2 }),
        sport_id: 2,
        name: faker.helpers.arrayElement(['AFC', 'NFC'])
      },
      division: {
        division_id: faker.number.int({ min: 1, max: 8 }),
        conference_id: faker.number.int({ min: 1, max: 2 }),
        sport_id: 2,
        name: faker.helpers.arrayElement(['North', 'South', 'East', 'West'])
      }
    }
  ],
  schedule: {
    league_name: 'National Football League',
    conference_competition: faker.datatype.boolean(),
    season_type: faker.helpers.arrayElement(['regular', 'preseason', 'postseason']),
    season_year: faker.date.future().getFullYear(),
    week: faker.number.int({ min: 1, max: 18 }),
    week_name: `Week ${faker.number.int({ min: 1, max: 18 })}`,
    week_detail: faker.lorem.sentence(),
    event_name: `${faker.company.name()} at ${faker.company.name()}`,
    attendance: faker.number.int({ min: 1000, max: 100000 }).toString()
  },
  odds: {
    moneyline: {
      moneyline_away: faker.number.int({ min: -500, max: 500 }),
      moneyline_away_delta: faker.number.float({ min: -50, max: 50, multipleOf: 0.1 }),
      moneyline_home: faker.number.int({ min: -500, max: 500 }),
      moneyline_home_delta: faker.number.float({ min: -50, max: 50, multipleOf: 0.1 }),
      moneyline_draw: faker.number.int({ min: 1000, max: 5000 }),
      moneyline_draw_delta: faker.number.float({ min: -50, max: 50, multipleOf: 0.1 })
    },
    spread: {
      point_spread_away: faker.number.float({ min: -14, max: 14, multipleOf: 0.5 }),
      point_spread_away_delta: faker.number.float({ min: -2, max: 2, multipleOf: 0.1 }),
      point_spread_home: faker.number.float({ min: -14, max: 14, multipleOf: 0.5 }),
      point_spread_home_delta: faker.number.float({ min: -2, max: 2, multipleOf: 0.1 }),
      point_spread_away_money: faker.number.int({ min: -150, max: 150 }),
      point_spread_away_money_delta: faker.number.float({ min: -20, max: 20, multipleOf: 0.1 }),
      point_spread_home_money: faker.number.int({ min: -150, max: 150 }),
      point_spread_home_money_delta: faker.number.float({ min: -20, max: 20, multipleOf: 0.1 })
    },
    total: {
      total_over: faker.number.float({ min: 30, max: 60, multipleOf: 0.5 }),
      total_over_delta: faker.number.float({ min: -2, max: 2, multipleOf: 0.1 }),
      total_under: faker.number.float({ min: 30, max: 60, multipleOf: 0.5 }),
      total_under_delta: faker.number.float({ min: -2, max: 2, multipleOf: 0.1 }),
      total_over_money: faker.number.int({ min: -150, max: 150 }),
      total_over_money_delta: faker.number.float({ min: -20, max: 20, multipleOf: 0.1 }),
      total_under_money: faker.number.int({ min: -150, max: 150 }),
      total_under_money_delta: faker.number.float({ min: -20, max: 20, multipleOf: 0.1 })
    }
  },
  favored_team: faker.helpers.arrayElement(['away', 'home']),
  ...overrides
});

module.exports = {
  createUser,
  createAdmin,
  createRequest,
  createPool,
  createEntry,
  createPick,
  createGame,
  createObjectId
};