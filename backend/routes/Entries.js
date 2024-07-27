// routes/entries.js
const express = require('express');
const {
  getUserEntries,
  getEntry,
  createEntry,
  getEntriesForPool,
  updateEntry,
  deleteEntry,
  requestEntry,
  approveEntry,
  addOrUpdatePick,
  getPickForWeek,
  updatePick,
  deletePick
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

/**
 * @swagger
 * /api/v1/pools/{poolId}/request-entry:
 *   post:
 *     summary: Request entry to a pool
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
 *       201:
 *         description: Entry request created
 *       400:
 *         description: Bad request
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Pool not found
 */
router.route('/:poolId/request-entry')
  .post(protect, requestEntry);

/**
 * @swagger
 * /api/v1/pools/{poolId}/entries:
 *   post:
 *     summary: Create a new entry for a pool
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
 *       201:
 *         description: Created entry
 *       400:
 *         description: Bad request
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Pool not found
 */
router.route('/:poolId/entries')
  .post(protect, checkGameStart, createEntry);

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
  .get(protect, getEntriesForPool)
  .post(protect, checkGameStart, createEntry);

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
 *   put:
 *     summary: Update an entry
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
 *         description: Updated entry
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Entry not found
 *   delete:
 *     summary: Delete an entry
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
 *         description: Entry deleted
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Entry not found
 */
router.route('/:id')
  .get(protect, getEntry)
  .put(protect, checkGameStart, updateEntry)
  .delete(protect, deleteEntry);

/**
 * @swagger
 * /api/v1/entries/{id}/approve:
 *   put:
 *     summary: Approve an entry request
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
 *         description: Entry approved
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Entry request not found
 */
router.route('/:id/approve')
  .put(protect, authorize('admin'), approveEntry);

// Add or update a pick
router.route('/:entryId/picks')
  .post(protect, checkGameStart, addOrUpdatePick);

// Update a pick
router.route('/:entryId/picks/:pickId')
  .put(protect, checkGameStart, updatePick);

// Delete a pick
router.route('/:entryId/picks/:pickId')
  .delete(protect, checkGameStart, deletePick);

// Get a pick for a specific week
router.route('/:entryId/picks/:week')
  .get(protect, getPickForWeek);

module.exports = router;