const express = require('express');
const { getSpotifyAuthURL, handleSpotifyCallback, checkSpotifyToken, refreshSpotifyToken } = require('../controllers/spotifyAuthController');
const { authenticateToken } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/connect', authenticateToken, getSpotifyAuthURL);
router.get('/callback', handleSpotifyCallback);
router.get('/status', authenticateToken, checkSpotifyToken);
router.get('/refresh', refreshSpotifyToken);

module.exports = router;