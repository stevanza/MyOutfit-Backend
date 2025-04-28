const express = require('express');
const router = express.Router();
const recommendController = require('../controllers/recommendController');

// Get outfit recommendations based on weather and/or mood
router.get('/', recommendController.getRecommendations);

module.exports = router;