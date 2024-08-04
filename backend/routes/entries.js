// routes/entries.js
const express = require('express');
const {
  getUserEntries,
  getEntry,
  getEntriesForPool,
  addOrUpdatePick,
  getPickForWeek,
  getUserEntriesWithPicks
} = require('../controllers/entries');
const { protect, authorize } = require('../middleware/auth');
const checkGameStart = require('../middleware/checkGameStart');

const router = express.Router({ mergeParams: true });

/**
 * @swagger
 * /api/v1/entries/user:
 *   get:
 *     summary: Get all entries for the current user
 *     tags: [Entries]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's entries
 *       401:
 *         description: Not authorized
 */
router.route('/user')
  .get(protect, getUserEntries);

router.get('/user/with-picks', protect, getUserEntriesWithPicks);

/**
 * @swagger
 * /api/v1/pools/{poolId}/entries:
 *   get:
 *     summary: Get all entries for a pool
 *     tags: [Entries]
 *     parameters:
 *       - in: path
 *         name: poolId
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of entries
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Pool not found
 */
router.route('/')
  .get(protect, getEntriesForPool);

/**
 * @swagger
 * /api/v1/entries/{id}:
 *   get:
 *     summary: Get a single entry
 *     tags: [Entries]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Entry details
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Entry not found
 */
router.route('/:id')
  .get(protect, getEntry);

// Add or update a pick
router.route('/:entryId/picks')
  .post(protect, checkGameStart, addOrUpdatePick);

// Get a pick for a specific week
router.route('/:entryId/:entryNumber/picks/:week')
  .get(protect, getPickForWeek);

module.exports = router;