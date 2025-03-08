const { spotifyApi } = require('../config/spotifyConfig');
const playlistService = require('../services/playlistService');

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

module.exports = {
    getAllPlaylists,
    savePlaylists,
    savePlaylistSongs
};