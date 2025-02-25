const express = require('express');
const { getSpotifyAuthURL, handleSpotifyCallback } = require('../controllers/spotifyController');
const { authenticateToken } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/connect', authenticateToken, getSpotifyAuthURL);
router.get('/callback', handleSpotifyCallback);

module.exports = router;