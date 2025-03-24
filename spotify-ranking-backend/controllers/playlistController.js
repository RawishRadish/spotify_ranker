const playlistService = require('../services/playlistService');
const spotifyRequest = require('../middlewares/spotifyRequest');

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

// Save selected playlists from the Spotify user to the database
const savePlaylists = async (req, res) => {
    const userId = req.session.userId;
    const { playlistIds } = req.body;
    try {
        for (const playlistId of playlistIds) {
            const playlistData = await spotifyRequest(req, `playlists/${playlistId}`);
            await playlistService.savePlaylistToDb(playlistData, userId);
        }
        res.status(201).send('Playlists saved');
    } catch (error) {
        console.error('Error saving playlists:', error);
        res.status(500).send('Error saving playlists');
    }
};

// Fetch all playlists from Spotify
const getPlaylists = async (req, res) => {
    try {
        const response = await playlistService.getPlaylists(req);
        res.json(response);
    } catch (error) {
        console.error('Error fetching playlists:', error);
        res.status(500).json({ error: 'Error fetching playlists' });
    }
}

// Save all songs from a playlist to the database
const savePlaylistSongs = async (req, res) => {
    const playlistId = req.params.id;
    try {
        const allTracks = await playlistService.getPlaylistSongs(req, playlistId);
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

// Get information about a single playlist
const getPlaylistInfo = async (req, res) => {
    console.log('Request came in for playlist: ', req.params.id);
    const { id: playlistId } = req.params;
    try {
        const response = await playlistService.getPlaylistInfo(req, playlistId);
        res.json(response);
    } catch (error) {
        console.error('Error in controller:', error);
        res.status(500).json({ error: 'Error fetching playlist info' });
    }
}

// Export the functions
module.exports = {
    getAllPlaylists,
    getPlaylists,
    savePlaylists,
    savePlaylistSongs,
    getRankedPlaylist,
    getPlaylistInfo,
};