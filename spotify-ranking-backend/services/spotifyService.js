const axios = require('axios');
const querystring = require('querystring');

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

const getSpotifyUserId = async (accessToken) => {
    console.log('Getting Spotify user ID');
    const response = await axios.get('https://api.spotify.com/v1/me', {
        headers: { Authorization: `Bearer ${accessToken}` }
    });
    return response.data.id;
};

module.exports = { generateSpotifyAuthUrl, exchangeCodeForTokens, getSpotifyUserId };