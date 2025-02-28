const db = require('../db');
const { axios } = require('axios');
const querystring = require('querystring');

// Generate Spotify auth URL
const generateSpotifyAuthUrl = () => {
    console.log('Creating Spotify auth URL');
    const queryParams = {
        client_id: process.env.SPOTIFY_CLIENT_ID,
        response_type: 'code',
        redirect_uri: process.env.REDIRECT_URI,
        scope: 'user-read-private playlist-read-private'
    };
    const authURL = `https://accounts.spotify.com/authorize?${querystring.stringify(queryParams)}`;
    return authURL;
};

// Exchange code for access and refresh tokens
const exchangeCodeForTokens = async (code) => {
    console.log('Exchanging code for tokens');
    const params = new URLSearchParams();
        params.append('grant_type', 'authorization_code');
        params.append('code', code);
        params.append('redirect_uri', process.env.REDIRECT_URI);
        params.append('client_id', process.env.SPOTIFY_CLIENT_ID);
        params.append('client_secret', process.env.SPOTIFY_CLIENT_SECRET);
    
    const response = await axios.post('https://accounts.spotify.com/api/token', params, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    });
    return response.data;
};

// Get Spotify refresh token from database
const getSpotifyRefreshToken = async (accessToken) => {
    console.log('Searching for Refresh Token in database');
    const response = await db.query(
        `SELECT spotify_refresh_token
        FROM users
        WHERE spotify_access_token = $1`, [accessToken]
    );
    return response.rows[0].spotify_refresh_token;
};

// Update Spotify tokens in database
const updateSpotifyTokens = async (newAccessToken, newRefreshToken, oldRefreshToken) => {
    console.log('Updating Spotify tokens');
    await db.query(
        `UPDATE users
        SET spotify_access_token = $1,
            spotify_refresh_token = $2
        WHERE spotify_refresh_token = $3`, [newAccessToken, newRefreshToken, oldRefreshToken]
    );
}

// Check if user is authenticated
const checkSpotifyToken = async (req, res, next) => {
    console.log('Checking Spotify token');
    
}

// Export functions
module.exports = {
    generateSpotifyAuthUrl,
    exchangeCodeForTokens,
    getSpotifyRefreshToken,
    updateSpotifyTokens
};