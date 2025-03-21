const { spotifyApi } = require('../config/spotifyConfig');
const playlistService = require('../services/playlistService');

// Fetch all playlists from the database
const getAllPlaylists = async (req, res) => {
    const userId = req.user.id;
    try {
        const playlists = await playlistService.getAllPlaylistsFromDb(userId);
        res.json(playlists);
    } catch (error) {
        console.error('Error getting playlists:', error);
        res.status(500).send('Error getting playlists');
    }
};

// Save all playlists from the Spotify user to the database
const savePlaylists = async (req, res) => {
    const userId = req.user.id;
    try {
        const response = await spotifyApi.get('/me/playlists');
        const playlists = response.data.items;
        await playlistService.savePlaylistsToDb(playlists, userId);
        res.status(201).send('Playlists saved');
    } catch (error) {
        console.error('Error saving playlists:', error);
        res.status(500).send('Error saving playlists');
    }
};

// Save all songs from a playlist to the database
const savePlaylistSongs = async (req, res) => {
    const playlistId = req.params.id;
    try {
        const allTracks = await playlistService.getPlaylistSongs(playlistId);
        await playlistService.savePlaylistSongsToDb(allTracks, playlistId);
        res.status(201).send('Songs saved');
    } catch (error) {
        console.error('Error saving songs:', error);
        res.status(500).send('Error saving songs');
    }
}

// Get the playlist ranked by openskill rating (best to worst)
const getRankedPlaylist = async (req, res) => {
    const { playlist_id } = req.params;
    try {
        const rankedTracks = await playlistService.getRankedPlaylist(playlist_id);
        res.json(rankedTracks);
    } catch (error) {
        console.error('Error fetching ranked playlist:', error);
        res.status(500).json({ error: 'Error fetching ranked playlist' });
    }
};

// Export the functions
module.exports = {
    getAllPlaylists,
    savePlaylists,
    savePlaylistSongs,
    getRankedPlaylist
};