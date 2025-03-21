const express = require('express');
const router = express.Router();
const compareController = require('../controllers/compareController');


router.get('/fetch/:playlist_id', compareController.getSongPairs);
router.post('/compare/:playlist_id', compareController.compareSongs);
router.post('/undo/:playlist_id', compareController.undoComparison);

router.post('/preview', compareController.getPreviewUrl);


module.exports = router;