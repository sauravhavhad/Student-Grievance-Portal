const express = require('express');
const router = express.Router();
const {
  getDashboard,
  getAllGrievances,
  deleteGrievance,
  getStaff,
  createStaff,
  deleteStaff,
  getAdminProfile,
} = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.use(protect, authorize('admin'));

router.get('/dashboard', getDashboard);

router.get('/grievances', getAllGrievances);
router.delete('/grievances/:id', deleteGrievance);

router.get('/staff', getStaff);
router.post('/staff', createStaff);
router.delete('/staff/:id', deleteStaff);

router.get('/profile', getAdminProfile);

module.exports = router;
