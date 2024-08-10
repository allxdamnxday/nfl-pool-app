const crypto = require('crypto');

class MockUser {
  constructor(userData) {
    this._id = userData._id || '5f7d0f1c8f9b9a0b7c8f9b9a';
    this.firstName = userData.firstName || 'John';
    this.lastName = userData.lastName || 'Doe';
    this.username = userData.username || 'johndoe';
    this.email = userData.email || 'john@example.com';
    this.password = userData.password || 'hashedpassword123';
    this.role = userData.role || 'user';
    this.isEmailVerified = userData.isEmailVerified || false;
    this.verificationToken = userData.verificationToken || crypto.randomBytes(20).toString('hex');
    this.verificationTokenExpire = userData.verificationTokenExpire || Date.now() + 24 * 60 * 60 * 1000;
    this.resetPasswordToken = userData.resetPasswordToken;
    this.resetPasswordExpire = userData.resetPasswordExpire;
    this.createdAt = userData.createdAt || new Date();
  }

  getSignedJwtToken() {
    return 'mockedJWTtoken';
  }

  async matchPassword(enteredPassword) {
    return enteredPassword === 'password123';
  }

  getResetPasswordToken() {
    const resetToken = crypto.randomBytes(20).toString('hex');
    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
    return resetToken;
  }
}

const mockUserModel = {
  create: jest.fn().mockImplementation(userData => Promise.resolve(new MockUser(userData))),
  findOne: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
};

module.exports = mockUserModel;