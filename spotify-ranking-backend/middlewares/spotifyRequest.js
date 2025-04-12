const axios = require('axios');
const { checkSpotifyToken } = require('../utils/tokenUtils');

const spotifyRequest = async (req, endpoint, {
    method = 'GET',
    data = null,
    params = {},
} = {}) => {
    console.log('Helper function spotifyRequest called with endpoint:', endpoint);

    // Check/refresh Spotify access token
    await checkSpotifyToken(req);

    const accessToken = req.session?.spotifyAccessToken;
    if (!accessToken) {
        throw new Error('No access token found in session');
    }

    try {
        const config = {
            method,
            url: `https://api.spotify.com/v1/${endpoint}`,
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            params,
        };

        if (method !== 'GET' && data) {
            config.data = data;
        }

        const response = await axios(config);
        return response.data;
    } catch (error) {
        console.error(`Spotify request error (${method} ${endpoint}):`, error);
        throw new Error('Error making request to Spotify API');
    }
};

module.exports = spotifyRequest;
