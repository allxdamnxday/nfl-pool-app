// routes/requests.js
const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { 
  createRequest, 
  approveRequest, 
  rejectRequest,
  getUserRequests,
  getPoolRequests,
  getRequest,
  confirmPayment
} = require('../controllers/requests');

const router = express.Router();

router.use(protect);

router.post('/', createRequest);
router.get('/', getUserRequests);
router.get('/pool/:poolId', authorize('admin'), getPoolRequests);
router.get('/:id', getRequest);
router.put('/:id/confirm-payment', confirmPayment);
router.put('/:id/approve', authorize('admin'), approveRequest);
router.put('/:id/reject', authorize('admin'), rejectRequest);

module.exports = router;