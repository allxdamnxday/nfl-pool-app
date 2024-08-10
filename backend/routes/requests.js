// routes/requests.js
const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const asyncHandler = require('../middleware/async');
const { 
  createRequest, 
  approveRequest, 
  rejectRequest,
  getUserRequests,
  getPoolRequests,
  getRequest,
  confirmPayment,
  getRequests
} = require('../controllers/requests');

const router = express.Router();

router.use(protect);

/**
 * @swagger
 * /api/v1/requests:
 *   post:
 *     summary: Create a new request
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - poolId
 *               - numberOfEntries
 *             properties:
 *               poolId:
 *                 type: string
 *               numberOfEntries:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Request created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Request'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/', asyncHandler(createRequest));

/**
 * @swagger
 * /api/v1/requests:
 *   get:
 *     summary: Get all requests (Admin only)
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all requests
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
 *                     $ref: '#/components/schemas/Request'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/', authorize('admin'), asyncHandler(getRequests));

/**
 * @swagger
 * /api/v1/requests/{id}:
 *   get:
 *     summary: Get a specific request
 *     tags: [Requests]
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
 *         description: Request details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Request'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Request not found
 */
router.get('/:id', asyncHandler(getRequest));

/**
 * @swagger
 * /api/v1/requests/{id}/confirm-payment:
 *   put:
 *     summary: Confirm payment for a request
 *     tags: [Requests]
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
 *             required:
 *               - transactionId
 *               - paymentType
 *             properties:
 *               transactionId:
 *                 type: string
 *               paymentType:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payment confirmed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Request'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Request not found
 */
router.put('/:id/confirm-payment', asyncHandler(confirmPayment));

/**
 * @swagger
 * /api/v1/requests/pool/{poolId}:
 *   get:
 *     summary: Get all requests for a specific pool (Admin only)
 *     tags: [Requests]
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
 *         description: List of pool requests
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
 *                     $ref: '#/components/schemas/Request'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/pool/:poolId', authorize('admin'), asyncHandler(getPoolRequests));

/**
 * @swagger
 * /api/v1/requests/{id}/approve:
 *   put:
 *     summary: Approve a request (Admin only)
 *     tags: [Requests]
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
 *         description: Request approved successfully
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
 *                     request:
 *                       $ref: '#/components/schemas/Request'
 *                     entries:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Entry'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Request not found
 */
router.put('/:id/approve', authorize('admin'), asyncHandler(approveRequest));

/**
 * @swagger
 * /api/v1/requests/{id}/reject:
 *   put:
 *     summary: Reject a request (Admin only)
 *     tags: [Requests]
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
 *         description: Request rejected successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Request'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Request not found
 */
router.put('/:id/reject', authorize('admin'), asyncHandler(rejectRequest));

module.exports = router;