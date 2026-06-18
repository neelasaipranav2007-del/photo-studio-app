const express = require('express');
const router = express.Router();
const { authUser, registerUser, changePassword, forgotPassword } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/login', authUser);
router.post('/register', registerUser);
router.post('/forgot-password', forgotPassword);
router.put('/change-password', protect, changePassword);

module.exports = router;
