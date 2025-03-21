const express = require('express');
const router = express.Router();
const compareController = require('../controllers/compareController');


router.get('/fetch/:playlist_id', compareController.getSongPairs);
router.post('/compare/:playlist_id', compareController.compareSongs);
router.post('/undo/:playlist_id', compareController.undoComparison);
router.post('/album-art', compareController.getAlbumArtUrl);
router.post('/preview', compareController.getPreviewUrl);
router.post('/external-url', compareController.getExternalUrl);


module.exports = router;