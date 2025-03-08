const express = require('express');
const router = express.Router();
const playlistController = require('../controllers/playlistController');
const { authenticateToken } = require('../middlewares/authMiddleware');

router.get('/playlists', authenticateToken, playlistController.getAllPlaylists);
router.post('/playlists', authenticateToken, playlistController.savePlaylists);
router.post('/playlists/:id/songs', authenticateToken, playlistController.savePlaylistSongs);

module.exports = router;