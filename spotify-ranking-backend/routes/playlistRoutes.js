const express = require('express');
const router = express.Router();
const playlistController = require('../controllers/playlistController');
const { authenticateToken } = require('../middlewares/authMiddleware');

router.get('/getfromdb', authenticateToken, playlistController.getAllPlaylists);
router.get('/info/:id', authenticateToken, playlistController.getPlaylistInfo);
router.post('/save', authenticateToken, playlistController.savePlaylists);
router.post('/save/:id/songs', authenticateToken, playlistController.savePlaylistSongs);
router.get('/ranked/:playlist_id', authenticateToken, playlistController.getRankedPlaylist);

router.get('/fetch', authenticateToken, playlistController.getPlaylists);

module.exports = router;