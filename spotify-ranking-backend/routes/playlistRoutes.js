const express = require('express');
const router = express.Router();
const playlistController = require('../controllers/playlistController');
const { authenticateToken } = require('../middlewares/authMiddleware');

router.get('/playlists', authenticateToken, playlistController.getAllPlaylists);
router.get('/playlists/:id', authenticateToken, playlistController.getPlaylistInfo);
router.post('/playlists', authenticateToken, playlistController.savePlaylists);
router.post('/playlists/:id/songs', authenticateToken, playlistController.savePlaylistSongs);
router.get('/playlists/:playlist_id/ranked', authenticateToken, playlistController.getRankedPlaylist);

module.exports = router;