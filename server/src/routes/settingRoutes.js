const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../controllers/settingController');
const { protect, admin } = require('../middlewares/authMiddleware');

router.route('/')
  .get(getSettings)
  .put(protect, admin, updateSettings);

module.exports = router;
