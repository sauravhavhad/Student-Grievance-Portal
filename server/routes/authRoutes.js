const express = require('express');
const router = express.Router();
const { registerStudent, login, logout, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', registerStudent);
router.post('/login', login);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);

module.exports = router;
