const compareService = require('../services/compareService');

// Fetch pairs of songs to compare
const getSongPairs = async (req, res) => {
    const { playlist_id } = req.params;

    try {
        const songPairs = await compareService.fetchSongPairs(playlist_id);
        res.json(songPairs);
    } catch (error) {
        console.error('Error fetching song pairs:', error);
        res.status(500).json({ error: 'Error fetching song pairs' });
    }
};

// Compare two songs and update their ratings
const compareSongs = async (req, res) => {
    const { playlist_id } = req.params;
    const { winner_id, loser_id } = req.body;

    try {
        await compareService.compareSongs(playlist_id, winner_id, loser_id);
        res.json({ message: 'Songs compared successfully' });
    } catch (error) {
        console.error('Error comparing songs:', error);
        res.status(500).json({ error: 'Error comparing songs' });
    }
};

module.exports = {
    getSongPairs,
    compareSongs
};