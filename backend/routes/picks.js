const express = require('express');
const { 
  getPicksForPool,
  getPickForWeek,
  addOrUpdatePick,
  deletePick
} = require('../controllers/picks');
const { protect } = require('../middleware/auth');
const checkGameStart = require('../middleware/checkGameStart');
const checkPickDeadline = require('../middleware/checkPickDeadline');
const router = express.Router({ mergeParams: true });

/**
 * @swagger
 * /api/v1/picks/pool/{poolId}:
 *   get:
 *     summary: Get all picks for a pool
 *     tags: [Picks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: poolId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the pool
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
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Pick'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.route('/pool/:poolId')
  .get(protect, getPicksForPool);

/**
 * @swagger
 * /api/v1/picks/{entryId}/{entryNumber}/{week}:
 *   get:
 *     summary: Get pick for a specific week
 *     tags: [Picks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: entryId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the entry
 *       - in: path
 *         name: entryNumber
 *         required: true
 *         schema:
 *           type: integer
 *         description: The entry number (1, 2, or 3)
 *       - in: path
 *         name: week
 *         required: true
 *         schema:
 *           type: integer
 *         description: The NFL week number (1-18)
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
 *                   $ref: '#/components/schemas/Pick'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *   put:
 *     summary: Update a pick
 *     tags: [Picks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: entryId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the entry
 *       - in: path
 *         name: entryNumber
 *         required: true
 *         schema:
 *           type: integer
 *         description: The entry number (1, 2, or 3)
 *       - in: path
 *         name: week
 *         required: true
 *         schema:
 *           type: integer
 *         description: The NFL week number (1-18)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               team:
 *                 type: string
 *                 description: The new team to pick
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
 *                   $ref: '#/components/schemas/Pick'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *   delete:
 *     summary: Delete a pick
 *     tags: [Picks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: entryId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the entry
 *       - in: path
 *         name: entryNumber
 *         required: true
 *         schema:
 *           type: integer
 *         description: The entry number (1, 2, or 3)
 *       - in: path
 *         name: week
 *         required: true
 *         schema:
 *           type: integer
 *         description: The NFL week number (1-18)
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
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.route('/:entryId/:entryNumber?/:week')
  .get(protect, getPickForWeek)
  .put(protect, checkGameStart, checkPickDeadline, addOrUpdatePick)
  .delete(protect, deletePick);

module.exports = router;