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
const checkPickDeadline = require('../middleware/checkPickDeadline');
const pickService = require('../services/pickService');

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
 */
router.route('/user')
  .get(protect, getUserEntries);

/**
 * @swagger
 * /api/v1/entries/user/with-picks:
 *   get:
 *     summary: Get all entries for the current user with picks
 *     tags: [Entries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: populate
 *         schema:
 *           type: string
 *         description: Populate picks.game data
 *     responses:
 *       200:
 *         description: List of user's entries with picks
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
 *                     $ref: '#/components/schemas/EntryWithPicks'
 *       401:
 *         description: Not authorized
 */
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Entry'
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Entry not found
 */
router.route('/:id')
  .get(protect, getEntry);

/**
 * @swagger
 * /api/v1/entries/{entryId}/picks:
 *   post:
 *     summary: Add or update a pick for an entry
 *     tags: [Entries]
 *     parameters:
 *       - in: path
 *         name: entryId
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - team
 *               - week
 *             properties:
 *               team:
 *                 type: string
 *               week:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Pick added or updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Pick'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Entry not found
 */
router.route('/:entryId/picks')
  .post(protect, checkGameStart, addOrUpdatePick);

/**
 * @swagger
 * /api/v1/entries/{entryId}/{entryNumber}/picks/{week}:
 *   get:
 *     summary: Get a pick for a specific week
 *     tags: [Entries]
 *     parameters:
 *       - in: path
 *         name: entryId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: entryNumber
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: week
 *         required: true
 *         schema:
 *           type: integer
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Pick details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Pick'
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Entry or pick not found
 */
router.route('/:entryId/:entryNumber/picks/:week')
  .get(protect, getPickForWeek);

/**
 * @swagger
 * /api/v1/entries/{entryId}/{entryNumber}/picks/{week}:
 *   delete:
 *     summary: Delete a pick for a specific week
 *     tags: [Entries]
 *     parameters:
 *       - in: path
 *         name: entryId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: entryNumber
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: week
 *         required: true
 *         schema:
 *           type: integer
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Pick deleted successfully
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
 *                     message:
 *                       type: string
 *       400:
 *         description: Bad request (e.g., game has already started)
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Entry or pick not found
 */
router.delete('/:entryId/:entryNumber/picks/:week', 
  protect, 
  checkGameStart, 
  checkPickDeadline,
  async (req, res, next) => {
    try {
      const { entryId, entryNumber, week } = req.params;
      const userId = req.user.id;

      await pickService.deletePick(entryId, parseInt(entryNumber), parseInt(week), userId);

      res.status(200).json({
        success: true,
        data: { message: 'Pick deleted successfully' }
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;