const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../../models/User');
const { connect, closeDatabase, clearDatabase } = require('../testSetup');
const { createUser } = require('../mockDataFactory');

beforeAll(async () => await connect());
afterEach(async () => await clearDatabase());
afterAll(async () => await closeDatabase());

describe('User Model Test', () => {
  it('should create & save user successfully', async () => {
    const validUser = createUser();
    const savedUser = await User.create(validUser);
    
    // Object Id should be defined when successfully saved to MongoDB.
    expect(savedUser._id).toBeDefined();
    expect(savedUser.firstName).toBe(validUser.firstName);
    expect(savedUser.lastName).toBe(validUser.lastName);
    expect(savedUser.email).toBe(validUser.email);
    expect(savedUser.username).toBe(validUser.username);
    expect(savedUser.role).toBe(validUser.role);
    expect(savedUser.isEmailVerified).toBe(validUser.isEmailVerified);
  });

  it('should fail to create user with duplicate email', async () => {
    const validUser = createUser();
    await User.create(validUser);
    
    await expect(User.create(validUser)).rejects.toThrow(/Email already exists|duplicate key error/);
  });

  it('should fail to create user with invalid email', async () => {
    const invalidUser = createUser({ email: 'invalid-email' });
    
    await expect(User.create(invalidUser)).rejects.toThrow(mongoose.Error.ValidationError);
  });

  it('should hash password before saving', async () => {
    const validUser = createUser();
    const savedUser = await User.create(validUser);
    
    expect(savedUser.password).not.toBe(validUser.password);
    const isMatch = await bcrypt.compare(validUser.password, savedUser.password);
    expect(isMatch).toBe(true);
  });

  it('should generate JWT token', async () => {
    const validUser = createUser();
    const savedUser = await User.create(validUser);
    
    const token = savedUser.getSignedJwtToken();
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
  });

  it('should match password correctly', async () => {
    const validUser = createUser();
    const savedUser = await User.create(validUser);
    
    const isMatch = await savedUser.matchPassword(validUser.password);
    expect(isMatch).toBe(true);

    const isNotMatch = await savedUser.matchPassword('wrongpassword');
    expect(isNotMatch).toBe(false);
  });

  it('should generate reset password token', async () => {
    const validUser = createUser();
    console.log('Generated user:', validUser);
    const savedUser = await User.create(validUser);
    
    const resetToken = savedUser.getResetPasswordToken();
    await savedUser.save(); // Add this line to save the changes

    expect(resetToken).toBeDefined();
    expect(typeof resetToken).toBe('string');
    expect(savedUser.resetPasswordToken).toBeDefined();
    expect(savedUser.resetPasswordExpire).toBeDefined();
  });

  it('should update user successfully', async () => {
    const validUser = createUser();
    const savedUser = await User.create(validUser);
    
    const updatedData = { firstName: 'UpdatedName' };
    const updatedUser = await User.findByIdAndUpdate(savedUser._id, updatedData, { new: true });
    
    expect(updatedUser.firstName).toBe('UpdatedName');
  });

  it('should delete user successfully', async () => {
    const validUser = createUser();
    const savedUser = await User.create(validUser);
    
    await User.findByIdAndDelete(savedUser._id);
    const deletedUser = await User.findById(savedUser._id);
    
    expect(deletedUser).toBeNull();
  });
});