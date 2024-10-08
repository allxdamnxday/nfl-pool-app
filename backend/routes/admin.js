const express = require('express');
const {
  getUsers,
  getUser,
  updateUserByQuery,
  deleteUser,
  getAppStats,
  syncRundownData,
  grantAdminPrivileges,
  createUser,
  syncNFLSchedule,
  updateGameData,
  initializeSeasonData
} = require('../controllers/admin');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');
const asyncHandler = require('../middleware/async');

router.use(protect);
router.use(authorize('admin'));

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin management
 */

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: Get all users
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */
router.route('/users')
  .get(asyncHandler(getUsers))
  .post(asyncHandler(createUser))
  .put(asyncHandler(updateUserByQuery));

/**
 * @swagger
 * /admin/users/{id}:
 *   get:
 *     summary: Get a single user by ID
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID
 *     responses:
 *       200:
 *         description: User data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 */
router.route('/users/:id')
  .get(asyncHandler(getUser))
  /**
   * @swagger
   * /admin/users/{id}:
   *   put:
   *     summary: Update a user by ID
   *     tags: [Admin]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: The user ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/User'
   *     responses:
   *       200:
   *         description: Updated user data
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/User'
   */
  .put(asyncHandler(updateUserByQuery))
  /**
   * @swagger
   * /admin/users/{id}:
   *   delete:
   *     summary: Delete a user by ID
   *     tags: [Admin]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: The user ID
   *     responses:
   *       200:
   *         description: User deleted successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   type: object
   */
  .delete(asyncHandler(deleteUser));

/**
 * @swagger
 * /admin/users/{id}/grant-admin:
 *   put:
 *     summary: Grant admin privileges to a user
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID
 *     responses:
 *       200:
 *         description: User granted admin privileges
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 */
router.put('/users/:id/grant-admin', asyncHandler(grantAdminPrivileges));

/**
 * @swagger
 * /admin/stats:
 *   get:
 *     summary: Get application statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Application statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 */
router.get('/stats', asyncHandler(getAppStats));

/**
 * @swagger
 * /admin/sync-rundown:
 *   post:
 *     summary: Sync rundown data
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *               limit:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Data synced successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 */
router.post('/sync-rundown', asyncHandler(syncRundownData));

/**
 * @swagger
 * /admin/sync-schedule:
 *   post:
 *     summary: Sync NFL schedule
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: NFL schedule synced successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: string
 */
router.post('/sync-schedule', asyncHandler(syncNFLSchedule));

/**
 * @swagger
 * /admin/update-game-data:
 *   post:
 *     summary: Update game data
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *     responses:
 *       200:
 *         description: Game data updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 */
router.post('/update-game-data', asyncHandler(updateGameData));

/**
 * @swagger
 * /admin/initialize-season:
 *   post:
 *     summary: Initialize new season
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               year:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Season initialized successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 */
router.post('/initialize-season', asyncHandler(initializeSeasonData));

module.exports = router;