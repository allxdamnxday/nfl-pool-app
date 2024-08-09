const mongoose = require('mongoose');
const moment = require('moment');
const Pick = require('../../models/Pick');
const Game = require('../../models/Game');
const { connect, closeDatabase, clearDatabase } = require('../testSetup');
const { createTestUser, createTestPool, createTestEntry, createTestPick, createTestRequest, createTestGame } = require('../testUtils');

beforeAll(async () => await connect());
afterEach(async () => await clearDatabase());
afterAll(async () => await closeDatabase());

describe('Pick Model Test', () => {
  let user, pool, entry, request, game;

  beforeEach(async () => {
    user = await createTestUser();
    pool = await createTestPool(user._id);
    request = await createTestRequest(user._id, pool._id);
    entry = await createTestEntry(user._id, pool._id, request._id);
    game = await createTestGame({ week: 1, homeTeam: 'Patriots', awayTeam: 'Jets', startTime: moment().add(1, 'days').toDate() });
  });

  it('should create & save pick successfully', async () => {
    const validPick = await createTestPick(entry._id, { week: 1, entryNumber: 1, team: 'Patriots', game: game._id });
    expect(validPick._id).toBeDefined();
    expect(validPick.entry.toString()).toBe(entry._id.toString());
    expect(validPick.team).toBe('Patriots');
    expect(validPick.week).toBe(1);
    expect(validPick.entryNumber).toBe(1);
    expect(validPick.result).toBe('pending');
    expect(validPick.pickMadeAt).toBeDefined();
    expect(validPick.game.toString()).toBe(game._id.toString());
  });

  it('should fail to create pick without required fields', async () => {
    const invalidPick = new Pick({});
    await expect(invalidPick.save()).rejects.toThrow(mongoose.Error.ValidationError);
  });

  it('should fail to create pick with invalid entryNumber', async () => {
    const invalidPick = new Pick({
      entry: entry._id,
      entryNumber: 4,
      week: 1,
      team: 'Patriots',
      game: game._id
    });
    await expect(invalidPick.save()).rejects.toThrow(mongoose.Error.ValidationError);
  });

  it('should fail to create pick with invalid week', async () => {
    const invalidPick = new Pick({
      entry: entry._id,
      entryNumber: 1,
      week: 19,
      team: 'Patriots',
      game: game._id
    });
    await expect(invalidPick.save()).rejects.toThrow(mongoose.Error.ValidationError);
  });

  it('should fail to create duplicate pick for same entry, entryNumber, and week', async () => {
    await createTestPick(entry._id, { week: 1, entryNumber: 1, team: 'Patriots', game: game._id });
    const duplicatePick = new Pick({
      entry: entry._id,
      entryNumber: 1,
      week: 1,
      team: 'Jets',
      game: game._id
    });
    await expect(duplicatePick.save()).rejects.toThrow(/duplicate key error/);
  });

  it('should update pick successfully', async () => {
    const pick = await createTestPick(entry._id, { week: 1, entryNumber: 1, team: 'Patriots', game: game._id });
    const originalPickMadeAt = pick.pickMadeAt;
    
    // Wait a moment to ensure the pickMadeAt time changes
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    pick.result = 'win';
    const updatedPick = await pick.save();
    expect(updatedPick.result).toBe('win');
    expect(updatedPick.pickMadeAt).not.toEqual(originalPickMadeAt);
  });

  it('should delete pick successfully', async () => {
    const pick = await createTestPick(entry._id, { week: 1, entryNumber: 1, team: 'Patriots', game: game._id });
    await Pick.findByIdAndDelete(pick._id);
    const deletedPick = await Pick.findById(pick._id);
    expect(deletedPick).toBeNull();
  });

  it('should find picks by entry', async () => {
    await createTestPick(entry._id, { week: 1, entryNumber: 1, team: 'Patriots', game: game._id });
    await createTestPick(entry._id, { week: 1, entryNumber: 2, team: 'Jets', game: game._id });
    const picks = await Pick.find({ entry: entry._id });
    expect(picks.length).toBe(2);
  });

  it('should validate result enum', async () => {
    const pick = await createTestPick(entry._id, { week: 1, entryNumber: 1, team: 'Patriots', game: game._id });
    pick.result = 'invalid';
    await expect(pick.save()).rejects.toThrow(mongoose.Error.ValidationError);
  });

  it('should not allow pick creation after game start time', async () => {
    const pastGame = await createTestGame({ week: 1, homeTeam: 'Patriots', awayTeam: 'Jets', startTime: moment().subtract(1, 'hours').toDate() });
    const invalidPick = new Pick({
      entry: entry._id,
      entryNumber: 1,
      week: 1,
      team: 'Patriots',
      game: pastGame._id
    });
    await expect(invalidPick.save()).rejects.toThrow(/Cannot make pick after game has started/);
  });

  it('should allow pick creation before game start time', async () => {
    const futureGame = await createTestGame({ week: 1, homeTeam: 'Patriots', awayTeam: 'Jets', startTime: moment().add(1, 'hours').toDate() });
    const validPick = new Pick({
      entry: entry._id,
      entryNumber: 1,
      week: 1,
      team: 'Patriots',
      game: futureGame._id
    });
    await expect(validPick.save()).resolves.toBeDefined();
  });
});