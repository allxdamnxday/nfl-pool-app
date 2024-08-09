const mongoose = require('mongoose');
const Game = require('../../models/Game');
const Settings = require('../../models/Settings');
const rundownApi = require('../../services/rundownApiService');
const seasonService = require('../../services/seasonService');
const { createGame } = require('../mockDataFactory');

jest.mock('../../models/Game');
jest.mock('../../models/Settings');
jest.mock('../../services/rundownApiService');

describe('SeasonService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('initializeSeasonData should initialize season data', async () => {
    const mockSchedules = [createGame()];
    rundownApi.fetchNFLSchedule.mockResolvedValue(mockSchedules);
    
    Game.bulkWrite.mockResolvedValue({ upsertedCount: 1, modifiedCount: 0 });
    Settings.findOneAndUpdate.mockResolvedValue();
  
    const result = await seasonService.initializeSeasonData(2024);
    expect(result).toEqual({ upsertedCount: 1, modifiedCount: 0 });
    expect(Game.bulkWrite).toHaveBeenCalled();
    expect(Settings.findOneAndUpdate).toHaveBeenCalledTimes(2);
  });

  test('updateGameData should update game data', async () => {
    const mockEvents = [createGame()];
    rundownApi.fetchNFLEvents.mockResolvedValue(mockEvents);
  
    Game.bulkWrite.mockResolvedValue({ upsertedCount: 1, modifiedCount: 1 });
    Settings.findOneAndUpdate.mockResolvedValue();
  
    await seasonService.updateGameData();
    expect(Game.bulkWrite).toHaveBeenCalled();
    expect(Settings.findOneAndUpdate).toHaveBeenCalled();
  });

  test('getGamesByWeek should retrieve games for a specific week and season', async () => {
    const mockGames = [createGame(), createGame()];
    Game.find.mockReturnValue({
      sort: jest.fn().mockResolvedValue(mockGames)
    });

    const result = await seasonService.getGamesByWeek(1, 2024);
    expect(result).toEqual(mockGames);
    expect(Game.find).toHaveBeenCalledWith({
      'schedule.season_year': 2024,
      'schedule.week': 1
    });
  });

  test('getCurrentWeekGames should retrieve games for the current week', async () => {
    const mockGames = [createGame(), createGame()];
    
    Game.find.mockReturnValue({
      sort: jest.fn().mockResolvedValue(mockGames)
    });

    const mockDate = new Date('2024-09-02');
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

    const result = await seasonService.getCurrentWeekGames();
    expect(result).toEqual(mockGames);
    expect(Game.find).toHaveBeenCalled();

    global.Date.mockRestore();
  });

  test('getSetting should retrieve a setting', async () => {
    const mockSetting = { key: 'testKey', value: 'testValue' };
    Settings.findOne.mockResolvedValue(mockSetting);

    const result = await seasonService.getSetting('testKey');
    expect(result).toBe('testValue');
    expect(Settings.findOne).toHaveBeenCalledWith({ key: 'testKey' });
  });

  test('updateSetting should update a setting', async () => {
    Settings.findOneAndUpdate.mockResolvedValue();

    await seasonService.updateSetting('testKey', 'newValue');
    expect(Settings.findOneAndUpdate).toHaveBeenCalledWith(
      { key: 'testKey' },
      { key: 'testKey', value: 'newValue' },
      { upsert: true }
    );
  });

  test('calculateNFLWeek should calculate the correct NFL week', () => {
    const testCases = [
      { date: new Date('2024-09-05T20:00:00-04:00'), expectedWeek: 1 }, // First game of Week 1 (Thursday night)
      { date: new Date('2024-09-11T23:59:59-04:00'), expectedWeek: 1 }, // Last minute of Week 1
      { date: new Date('2024-09-12T00:00:00-04:00'), expectedWeek: 2 }, // First minute of Week 2
      { date: new Date('2024-09-15T13:00:00-04:00'), expectedWeek: 2 }, // Sunday of Week 2
      { date: new Date('2024-09-22T13:00:00-04:00'), expectedWeek: 3 }, // Sunday of Week 3
      { date: new Date('2024-08-31T23:59:59-04:00'), expectedWeek: 0 }, // Just before season starts
      { date: new Date('2025-01-05T13:00:00-05:00'), expectedWeek: 18 }, // Last Sunday of regular season
    ];
  
    testCases.forEach(({ date, expectedWeek }) => {
      const seasonYear = 2024;
      console.log(`\nTesting date: ${date.toISOString()}`);
      const result = seasonService.calculateNFLWeek(date, seasonYear);
      console.log(`Expected: ${expectedWeek}, Actual: ${result}`);
      expect(result).toBe(expectedWeek);
    });
  });

  test('getCurrentSeasonYear should return the correct season year', () => {
    const mockDate = new Date('2024-09-15');
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

    const result = seasonService.getCurrentSeasonYear();
    expect(result).toBe(2024);

    global.Date.mockRestore();
  });

  test('getCurrentNFLWeek should return the current NFL week and season year', async () => {
    const mockDate = new Date('2024-09-15');
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

    const result = await seasonService.getCurrentNFLWeek();
    expect(result).toBe(1);

    global.Date.mockRestore();
  });
});