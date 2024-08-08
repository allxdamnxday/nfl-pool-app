// __tests__/services/baseService.test.js

const mongoose = require('mongoose');
const BaseService = require('../../services/baseService');
const { connect, closeDatabase, clearDatabase } = require('../testSetup');
const { createUser } = require('../mockDataFactory');
const User = require('../../models/User');

describe('BaseService', () => {
  let baseService;

  beforeAll(async () => await connect());
  afterEach(async () => await clearDatabase());
  afterAll(async () => await closeDatabase());

  beforeEach(() => {
    baseService = new BaseService(User);
  });

  describe('getAll', () => {
    it('should return all documents', async () => {
      const user1 = await User.create(createUser());
      const user2 = await User.create(createUser());

      const result = await baseService.getAll();

      expect(result).toHaveLength(2);
      expect(result[0]._id).toEqual(user1._id);
      expect(result[1]._id).toEqual(user2._id);
    });

    it('should return filtered documents', async () => {
      const activeUser = await User.create(createUser({ isEmailVerified: true }));
      await User.create(createUser({ isEmailVerified: false }));

      const result = await baseService.getAll({ isEmailVerified: true });

      expect(result).toHaveLength(1);
      expect(result[0]._id).toEqual(activeUser._id);
    });

    it('should throw an error if there is a problem', async () => {
      jest.spyOn(User, 'find').mockRejectedValueOnce(new Error('Database error'));

      await expect(baseService.getAll()).rejects.toThrow('Error retrieving User documents: Database error');
    });
  });

  describe('getById', () => {
    it('should return a document by id', async () => {
      const user = await User.create(createUser());

      const result = await baseService.getById(user._id);

      expect(result._id).toEqual(user._id);
    });

    it('should throw an error if document is not found', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      await expect(baseService.getById(fakeId)).rejects.toThrow('User not found with id of');
    });

    it('should throw an error if there is a problem', async () => {
      jest.spyOn(User, 'findById').mockRejectedValueOnce(new Error('Database error'));

      await expect(baseService.getById('fakeId')).rejects.toThrow('Error retrieving User: Database error');
    });
  });

  describe('create', () => {
    it('should create a new document', async () => {
      const userData = createUser();

      const result = await baseService.create(userData);

      expect(result._id).toBeDefined();
      expect(result.email).toBe(userData.email);
    });

    it('should throw an error if there is a problem', async () => {
      const invalidUserData = { invalidField: 'test' };

      await expect(baseService.create(invalidUserData)).rejects.toThrow('Error creating User:');
    });
  });

  describe('update', () => {
    it('should update a document', async () => {
      const user = await User.create(createUser());
      const updateData = { firstName: 'Updated Name' };

      const result = await baseService.update(user._id, updateData);

      expect(result.firstName).toBe('Updated Name');
    });

    it('should throw an error if document is not found', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      await expect(baseService.update(fakeId, {})).rejects.toThrow('User not found with id of');
    });

    it('should throw an error if there is a problem', async () => {
      const user = await User.create(createUser());
      const invalidUpdateData = { email: 'invalid-email' };

      await expect(baseService.update(user._id, invalidUpdateData)).rejects.toThrow('Error updating User:');
    });
  });

  describe('delete', () => {
    it('should delete a document', async () => {
      const user = await User.create(createUser());

      const result = await baseService.delete(user._id);

      expect(result._id).toEqual(user._id);
      const deletedUser = await User.findById(user._id);
      expect(deletedUser).toBeNull();
    });

    it('should throw an error if document is not found', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      await expect(baseService.delete(fakeId)).rejects.toThrow('User not found with id of');
    });

    it('should throw an error if there is a problem', async () => {
      jest.spyOn(User, 'findByIdAndDelete').mockRejectedValueOnce(new Error('Database error'));

      await expect(baseService.delete('fakeId')).rejects.toThrow('Error deleting User: Database error');
    });
  });
});