const express = require('express');
const router = express.Router();
const { getProfile } = require('../controllers/studentController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.get('/profile', protect, authorize('student'), getProfile);

module.exports = router;
