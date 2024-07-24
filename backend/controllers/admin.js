// backend/controllers/admin.js
const User = require('../models/User');
const Game = require('../models/Game');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const seasonService = require('../services/seasonService');

// @desc    Get all users
// @route   GET /api/v1/admin/users
// @access  Private/Admin
exports.getUsers = asyncHandler(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({
    success: true,
    data: users
  });
});

// @desc    Create user
// @route   POST /api/v1/admin/users
// @access  Private/Admin
exports.createUser = asyncHandler(async (req, res, next) => {
  const { username, email, password } = req.body;

  // Validate input
  if (!username || !email || !password) {
    return next(new ErrorResponse('Please provide all required fields', 400));
  }

  // Create user
  const user = await User.create({ username, email, password });

  res.status(201).json({
    success: true,
    data: user
  });
});

// @desc    Get single user
// @route   GET /api/v1/admin/users/:id
// @access  Private/Admin
exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
  }
  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Update user by username or email
// @route   PUT /api/v1/admin/users
// @access  Private/Admin
exports.updateUserByQuery = asyncHandler(async (req, res, next) => {
  const { username, email, ...updateData } = req.body;

  if (!username && !email) {
    return next(new ErrorResponse('Please provide a username or email to update', 400));
  }

  const query = username ? { username } : { email };
  
  // Ensure updateData includes the fields to be updated
  if (email && !username) updateData.email = email;
  if (username && !email) updateData.username = username;

  const user = await User.findOneAndUpdate(query, updateData, {
    new: true,
    runValidators: true
  });

  if (!user) {
    return next(new ErrorResponse(`User not found with ${username ? 'username' : 'email'} of ${username || email}`, 404));
  }

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Delete user
// @route   DELETE /api/v1/admin/users/:id
// @access  Private/Admin
exports.deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) {
    return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
  }
  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Get application statistics
// @route   GET /api/v1/admin/stats
// @access  Private/Admin
exports.getAppStats = asyncHandler(async (req, res, next) => {
  const stats = {
    usersCount: await User.countDocuments()
  };
  res.status(200).json({
    success: true,
    data: stats
  });
});

// @desc    Update game data
// @route   POST /api/v1/admin/update-game-data
// @access  Private/Admin
exports.updateGameData = asyncHandler(async (req, res, next) => {
  const { date } = req.body;
  if (!date) {
    return next(new ErrorResponse('Please provide a date', 400));
  }
  
  let parsedDate;
  try {
    parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      throw new Error('Invalid date');
    }
  } catch (error) {
    return next(new ErrorResponse('Please provide a valid date', 400));
  }

  await seasonService.updateGameData(parsedDate);
  res.status(200).json({ success: true, message: 'Game data updated successfully' });
});

// @desc    Initialize season data
// @route   POST /api/v1/admin/initialize-season
// @access  Private/Admin
exports.initializeSeasonData = asyncHandler(async (req, res, next) => {
  const { year } = req.body;
  if (!year || isNaN(parseInt(year))) {
    return next(new ErrorResponse('Please provide a valid year', 400));
  }
  try {
    const initializedGames = await seasonService.initializeSeasonData(parseInt(year));
    console.log(`Controller: Initialized ${initializedGames.length} games`);
    res.status(200).json({ 
      success: true, 
      message: 'Season data initialized successfully',
      count: initializedGames.length
    });
  } catch (error) {
    console.error('Controller: Error initializing season data:', error);
    next(new ErrorResponse('Failed to initialize season data', 500));
  }
});

// @desc    Sync rundown data
// @route   POST /api/v1/admin/sync-rundown
// @access  Private/Admin
exports.syncRundownData = asyncHandler(async (req, res, next) => {
  const { date, limit } = req.body;
  if (!date || isNaN(Date.parse(date))) {
    return next(new ErrorResponse('Please provide a valid date', 400));
  }
  await seasonService.fetchGames(new Date(date), limit);
  res.status(200).json({ success: true, message: 'Rundown data synced successfully' });
});

// @desc    Grant admin privileges to a user
// @route   PUT /api/v1/admin/users/:id/grant-admin
// @access  Private/Admin
exports.grantAdminPrivileges = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
  }

  user.role = 'admin';
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    data: user
  });
});