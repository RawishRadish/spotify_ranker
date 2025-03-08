const express = require('express');
const router = express.Router();
const compareController = require('../controllers/compareController');

router.get('/fetch/:playlist_id', compareController.getSongPairs);
router.post('/compare/:playlist_id', compareController.compareSongs);

module.exports = router;