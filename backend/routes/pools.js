// backend/routes/pools.js
const express = require('express');
const {
  getPools,
  getPool,
  createPool,
  updatePool,
  deletePool,
  joinPool,
  leavePool,
  getPoolStats
} = require('../controllers/pools');

const Pool = require('../models/Pool');

const router = express.Router();

const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');
const asyncHandler = require('../middleware/async');

/**
 * @swagger
 * components:
 *   schemas:
 *     Pool:
 *       type: object
 *       required:
 *         - name
 *         - season
 *         - maxParticipants
 *         - entryFee
 *         - prizeAmount
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the pool
 *         name:
 *           type: string
 *           description: The name of the pool
 *         season:
 *           type: number
 *           description: The season year of the pool
 *         currentWeek:
 *           type: number
 *           description: The current week of the pool
 *         status:
 *           type: string
 *           enum: [pending, active, completed]
 *           description: The status of the pool
 *         maxParticipants:
 *           type: number
 *           description: The maximum number of participants allowed in the pool
 *         entryFee:
 *           type: number
 *           description: The entry fee for the pool
 *         prizeAmount:
 *           type: number
 *           description: The prize amount for the pool winner
 *         creator:
 *           type: string
 *           description: The id of the user who created the pool
 *         participants:
 *           type: array
 *           items:
 *             type: string
 *           description: The ids of the users participating in the pool
 *         eliminatedUsers:
 *           type: array
 *           items:
 *             type: string
 *           description: The ids of the users eliminated from the pool
 */

/**
 * @swagger
 * /api/v1/pools:
 *   get:
 *     summary: Get all pools
 *     tags: [Pools]
 *     parameters:
 *       - in: query
 *         name: select
 *         schema:
 *           type: string
 *         description: Fields to select (comma-separated)
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *         description: Sort order (field:asc/desc)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 pagination:
 *                   type: object
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Pool'
 */
router.route('/')
  .get(advancedResults(Pool, 'participants'), asyncHandler(getPools))
  .post(protect, authorize('admin'), asyncHandler(createPool))

/**
 * @swagger
 *   post:
 *     summary: Create a new pool
 *     tags: [Pools]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Pool'
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Pool'
 */
.post(protect, authorize('admin'), asyncHandler(createPool));

/**
 * @swagger
 * /api/v1/pools/{id}:
 *   get:
 *     summary: Get a single pool
 *     tags: [Pools]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Pool ID
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Pool'
 */
router.route('/:id')
  .get(asyncHandler(getPool))
  .put(protect, authorize('admin'), asyncHandler(updatePool))
  .delete(protect, authorize('admin'), asyncHandler(deletePool));

/**
 * @swagger
 * /api/v1/pools/{id}/join:
 *   post:
 *     summary: Join a pool
 *     tags: [Pools]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Pool ID
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Pool'
 */
router.route('/:id/join').post(protect, asyncHandler(joinPool));

/**
 * @swagger
 * /api/v1/pools/{id}/leave:
 *   post:
 *     summary: Leave a pool
 *     tags: [Pools]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Pool ID
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Pool'
 */
router.route('/:id/leave').post(protect, asyncHandler(leavePool));

/**
 * @swagger
 * /api/v1/pools/{id}/stats:
 *   get:
 *     summary: Get pool statistics
 *     tags: [Pools]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Pool ID
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalParticipants:
 *                       type: integer
 *                     eliminatedParticipants:
 *                       type: integer
 *                     currentWeek:
 *                       type: integer
 */
router.route('/:id/stats').get(protect, asyncHandler(getPoolStats));

module.exports = router;