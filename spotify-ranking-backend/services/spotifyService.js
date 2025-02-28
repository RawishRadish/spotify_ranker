const { spotifyApi } = require('../config/spotifyConfig');

const getSpotifyUserId = async (accessToken) => {
    console.log('Getting Spotify user ID');
    const response = await spotifyApi.get('https://api.spotify.com/v1/me', {
        headers: { Authorization: `Bearer ${accessToken}` }
    });
    return response.data.id;
};

module.exports = {
    getSpotifyUserId, 
    };