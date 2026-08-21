const express = require('express');
const router = express.Router();
const {
  createGrievance,
  getMyGrievances,
  getGrievanceById,
  submitFeedback,
} = require('../controllers/grievanceController');
const { assignStaff, updateStatus } = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

// Student routes
router.post('/', protect, authorize('student'), createGrievance);
router.get('/my', protect, authorize('student'), getMyGrievances);
router.post('/:id/feedback', protect, authorize('student'), submitFeedback);

// Shared route (owner student, admin, or staff)
router.get('/:id', protect, getGrievanceById);

// Admin-only actions on a specific grievance
router.patch('/:id/status', protect, authorize('admin'), updateStatus);
router.patch('/:id/assign', protect, authorize('admin'), assignStaff);

module.exports = router;
