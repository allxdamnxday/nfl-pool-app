const express = require('express');
const {
  getPools,
  getPool,
  createPool,
  updatePool,
  deletePool,
  getPoolStats,
  getUserActivePools,
  getUserPools,
  getAvailablePools,
  updatePoolStatus,
  getPoolEntries,
  getUserPoolsWithEntries
} = require('../controllers/pools');

const Pool = require('../models/Pool');
const poolService = require('../services/poolService');

const router = express.Router();

const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');

// Public routes
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
 *         description: Sort criteria (field:asc/desc)
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
 *         description: List of pools
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
router.get('/', advancedResults(Pool), getPools);

// Protected routes
router.use(protect);

/**
 * @swagger
 * /api/v1/pools/available:
 *   get:
 *     summary: Get available pools for the current user
 *     tags: [Pools]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of available pools
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/PoolWithUserInfo'
 *       401:
 *         description: Not authorized
 */
router.get('/available', getAvailablePools);

/**
 * @swagger
 * /api/v1/pools/user:
 *   get:
 *     summary: Get pools for the current user
 *     tags: [Pools]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's pools
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/PoolWithEntries'
 *       401:
 *         description: Not authorized
 */
router.get('/user', getUserPools);

/**
 * @swagger
 * /api/v1/pools/user/active:
 *   get:
 *     summary: Get active pools for the current user
 *     tags: [Pools]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's active pools
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/PoolWithEntries'
 *       401:
 *         description: Not authorized
 */
router.get('/user/active', getUserActivePools);

/**
 * @swagger
 * /api/v1/pools/user/entries:
 *   get:
 *     summary: Get pools with entries for the current user
 *     tags: [Pools]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's pools with entries
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/PoolWithEntries'
 *       401:
 *         description: Not authorized
 */
router.get('/user/entries', getUserPoolsWithEntries);

/**
 * @swagger
 * /api/v1/pools:
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
 *             $ref: '#/components/schemas/PoolInput'
 *     responses:
 *       201:
 *         description: Created pool
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Pool'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Forbidden
 */
router.post('/', authorize('admin'), createPool);

/**
 * @swagger
 * /api/v1/pools/{id}:
 *   get:
 *     summary: Get a single pool
 *     tags: [Pools]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Pool details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Pool'
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Pool not found
 */
router.get('/:id', getPool);

/**
 * @swagger
 * /api/v1/pools/{id}:
 *   put:
 *     summary: Update a pool
 *     tags: [Pools]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PoolInput'
 *     responses:
 *       200:
 *         description: Updated pool
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Pool'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Pool not found
 */
router.put('/:id', authorize('admin'), updatePool);

/**
 * @swagger
 * /api/v1/pools/{id}:
 *   delete:
 *     summary: Delete a pool
 *     tags: [Pools]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Pool deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Pool not found
 */
router.delete('/:id', authorize('admin'), deletePool);

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
 *     responses:
 *       200:
 *         description: Pool statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/PoolStats'
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Pool not found
 */
router.get('/:id/stats', getPoolStats);

/**
 * @swagger
 * /api/v1/pools/{id}/entries:
 *   get:
 *     summary: Get entries for a pool
 *     tags: [Pools]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of entries for the pool
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Entry'
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Pool not found
 */
router.get('/:id/entries', getPoolEntries);

/**
 * @swagger
 * /api/v1/pools/{id}/status:
 *   put:
 *     summary: Update pool status
 *     tags: [Pools]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [open, closed, completed]
 *     responses:
 *       200:
 *         description: Pool status updated
 *         content:
 *           application/json:
 *             schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *               data:
 *                 $ref: '#/components/schemas/Pool'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Pool not found
 */
router.put('/:id/status', authorize('admin'), updatePoolStatus);

/**
 * @swagger
 * /api/v1/pools/{poolId}/picks:
 *   get:
 *     summary: Get all picks for a pool
 *     tags: [Pools]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: poolId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of picks for the pool
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/PoolPick'
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Pool not found
 */
router.get('/:poolId/picks', protect, async (req, res, next) => {
  try {
    const { picks, visibleWeeks } = await poolService.getAllPoolPicks(req.params.poolId);
    res.status(200).json({ success: true, data: { picks, visibleWeeks } });
  } catch (error) {
    next(error);
  }
});

module.exports = router;