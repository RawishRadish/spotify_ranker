const spotifyPreviewFinder = require('spotify-preview-finder');
const db = require('../db');
const { spotifyApi } = require('../config/spotifyConfig');

// Function to get the preview URL of a song
const getPreviewUrl = async (songs) => {
    console.log('Getting preview URL for:', songs);
    const result = await Promise.all(songs.map(async (song) => {
            const result = await spotifyPreviewFinder(`${song.title} - ${song.artist}`, 1);
            return result.results;
    }));
    
    // await spotifyPreviewFinder(songs);
    console.log('Preview URL:', result);
    return result;
};

// Fetch the album art URL of a song
const getAlbumArtUrl = async (song) => {
    const spotifyIdResult = await db.query(`
        SELECT spotify_song_id
        FROM songs
        WHERE id = $1;
        `, [song.id]);

    const spotifyId = spotifyIdResult.rows[0].spotify_song_id;
    const result = await spotifyApi.get(`/tracks/${spotifyId}`);
    console.log('Album art:', result.data.album.images[0].url);
    return result.data.album.images[0].url;
}

// Fetch the external URL of a song
const getExternalUrl = async (song) => {
    const spotifyIdResult = await db.query(`
        SELECT spotify_song_id
        FROM songs
        WHERE id = $1;
        `, [song.id]);

    const spotifyId = spotifyIdResult.rows[0].spotify_song_id;
    const result = await spotifyApi.get(`/tracks/${spotifyId}`);
    console.log('External URL:', result.data.external_urls.spotify);
    return result.data.external_urls.spotify;
}

// Export the functions
module.exports = {
    getPreviewUrl,
    getAlbumArtUrl,
    getExternalUrl
};