const { spotifyApi } = require('../config/spotifyConfig');

const getSpotifyUserId = async (userId) => {
    console.log('Getting Spotify user ID for user: ', userId);
    const response = await spotifyApi.get('/me', {
        headers: {
            'X-User-ID': userId,
        }
    });
    return response.data.id;
};

module.exports = {
    getSpotifyUserId, 
    };