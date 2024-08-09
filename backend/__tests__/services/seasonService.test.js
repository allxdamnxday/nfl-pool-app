const mongoose = require('mongoose');
const nock = require('nock');
const Game = require('../../models/Game');
const Settings = require('../../models/Settings');
const rundownApi = require('../../services/rundownApiService');
const seasonService = require('../../services/seasonService');
const config = require('../../config/rundownApi');

jest.mock('../../models/Game');
jest.mock('../../models/Settings');
jest.mock('../../services/rundownApiService');

describe('SeasonService', () => {
  afterEach(() => {
    jest.clearAllMocks();
    nock.cleanAll();
  });

  test('initializeSeasonData should initialize season data', async () => {
    const mockSchedules = [{ event_id: '1', date_event: '2024-09-02T00:00:00.000Z', season_year: 2024 }];
    rundownApi.fetchNFLSchedule.mockResolvedValue(mockSchedules);
    
    Game.bulkWrite.mockResolvedValue({ upsertedCount: 1, modifiedCount: 0 });
    Settings.findOneAndUpdate.mockResolvedValue();
  
    const result = await seasonService.initializeSeasonData(2024);
    expect(result).toEqual({ upsertedCount: 1, modifiedCount: 0 });
    expect(Game.bulkWrite).toHaveBeenCalled();
    expect(Settings.findOneAndUpdate).toHaveBeenCalledTimes(2);
  });

  test('updateGameData should update game data', async () => {
    const mockEvents = [{ event_id: '1', date_event: '2024-09-02T00:00:00.000Z', season_year: 2024 }];
    rundownApi.fetchNFLEvents.mockResolvedValue(mockEvents);
  
    Game.findOneAndUpdate.mockResolvedValue();
    Settings.findOneAndUpdate.mockResolvedValue();
  
    await seasonService.updateGameData(2024);
    expect(Game.findOneAndUpdate).toHaveBeenCalled();
    expect(Settings.findOneAndUpdate).toHaveBeenCalled();
  });

  test('getDetailedGameInfo should retrieve detailed game information', async () => {
    const mockEventData = { event_id: '1', date_event: '2024-09-02T00:00:00.000Z', season_year: 2024 };
    rundownApi.fetchEventDetails.mockResolvedValue(mockEventData);
  
    Game.findOneAndUpdate.mockResolvedValue(mockEventData);
  
    const result = await seasonService.getDetailedGameInfo('1');
    expect(result).toEqual(mockEventData);
    expect(Game.findOneAndUpdate).toHaveBeenCalled();
  });

  test('manageSeason should manage season data', async () => {
    // Mock the current date to be during the season
    const mockDate = new Date('2024-09-15');
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

    // Mock getStoredSeasonYear
    const getStoredSeasonYearMock = jest.spyOn(seasonService, 'getStoredSeasonYear').mockResolvedValue(2023);

    // Mock updateWeekNumbers
    const updateWeekNumbersMock = jest.spyOn(seasonService, 'updateWeekNumbers').mockResolvedValue();

    // Mock initializeSeasonData
    const initializeSeasonDataMock = jest.spyOn(seasonService, 'initializeSeasonData').mockResolvedValue();

    // Mock rundownApi.fetchNFLSchedule
    rundownApi.fetchNFLSchedule.mockResolvedValue([
      { event_id: '1', date_event: '2024-09-02T00:00:00.000Z', season_year: 2024 }
    ]);

    // Mock Game.bulkWrite
    Game.bulkWrite.mockResolvedValue({ upsertedCount: 1, modifiedCount: 0 });

    // Mock Settings.findOneAndUpdate
    Settings.findOneAndUpdate.mockResolvedValue({});

    await seasonService.manageSeason();
    
    // Wait for any potential asynchronous operations
    await new Promise(resolve => setImmediate(resolve));

    expect(getStoredSeasonYearMock).toHaveBeenCalled();
    expect(updateWeekNumbersMock).toHaveBeenCalledWith(2024);
    expect(initializeSeasonDataMock).toHaveBeenCalledWith(2024);

    // Restore all mocks
    global.Date.mockRestore();
    jest.restoreAllMocks();
  });

  test('updateHistoricalData should update game data for each day in the range', async () => {
    const mockEvents = [
      { event_id: '1', date_event: '2024-01-01T00:00:00.000Z' },
      { event_id: '2', date_event: '2024-01-02T00:00:00.000Z' },
      { event_id: '3', date_event: '2024-01-03T00:00:00.000Z' }
    ];
    
    rundownApi.fetchNFLEvents.mockResolvedValue(mockEvents);
    Game.findOneAndUpdate.mockResolvedValue({});
  
    const consoleSpy = jest.spyOn(console, 'log');
  
    const startDate = new Date('2024-01-01T00:00:00.000Z');
    const endDate = new Date('2024-01-03T00:00:00.000Z');
  
    await seasonService.updateHistoricalData(startDate, endDate);
    
    expect(rundownApi.fetchNFLEvents).toHaveBeenCalledTimes(3);
    expect(Game.findOneAndUpdate).toHaveBeenCalledTimes(9); // 3 events * 3 days
    expect(consoleSpy).toHaveBeenCalledWith(`Updated historical data from ${startDate.toISOString()} to ${endDate.toISOString()}`);
  
    consoleSpy.mockRestore();
  });

  test('getGamesByWeek should retrieve games for a specific week and season', async () => {
    const mockGames = [
      { event_date: '2024-09-02T00:00:00.000Z', schedule: { season_year: 2024, week: 1 } },
      { event_date: '2024-09-03T00:00:00.000Z', schedule: { season_year: 2024, week: 1 } }
    ];
    Game.find.mockReturnValue({
      sort: jest.fn().mockResolvedValue(mockGames)
    });

    const result = await seasonService.getGamesByWeek(1, 2024);
    expect(result).toEqual(mockGames);
    expect(Game.find).toHaveBeenCalledWith({ 'schedule.season_year': 2024 });
  });

  test('getCurrentWeekGames should retrieve games for the current week', async () => {
    const mockGames = [
      { event_date: '2024-09-02T00:00:00.000Z', schedule: { season_year: 2024, week: 1 } },
      { event_date: '2024-09-03T00:00:00.000Z', schedule: { season_year: 2024, week: 1 } }
    ];
    
    // Mock the find method to return an object with a sort method
    Game.find.mockReturnValue({
      sort: jest.fn().mockResolvedValue(mockGames)
    });

    const mockDate = new Date('2024-09-02');
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

    const result = await seasonService.getCurrentWeekGames();
    expect(result).toEqual(mockGames);
    expect(Game.find).toHaveBeenCalled();
    expect(Game.find().sort).toHaveBeenCalledWith('event_date');

    global.Date.mockRestore();
  });

  test('updateWeekNumbers should update week numbers for games in a specific season', async () => {
    const mockGames = [
      { event_date: '2024-09-02T00:00:00.000Z', schedule: { season_year: 2024, week: null }, save: jest.fn() },
      { event_date: '2024-09-09T00:00:00.000Z', schedule: { season_year: 2024, week: null }, save: jest.fn() }
    ];
    Game.find.mockResolvedValue(mockGames);

    await seasonService.updateWeekNumbers(2024);
    expect(Game.find).toHaveBeenCalledWith({ 'schedule.season_year': 2024, 'schedule.week': null });
    expect(mockGames[0].save).toHaveBeenCalled();
    expect(mockGames[1].save).toHaveBeenCalled();
  });

  test('getCurrentNFLWeek should retrieve the current NFL week and season year', async () => {
    const mockDate = new Date('2024-09-15');
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

    const result = await seasonService.getCurrentNFLWeek();
    expect(result).toEqual({ week: 1, seasonYear: 2024 });

    global.Date.mockRestore();
  });
});