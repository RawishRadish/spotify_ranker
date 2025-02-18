const express = require('express');
const axios = require('axios');
const router = express.Router();
const db = require('../db');

// Check if access token is still valid
async function isAccessTokenValid (accessToken) {
    try {
        const response = await axios.get('https://api.spotify.com/v1/me', {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        return response.status === 200;
    } catch (error) {
        console.error('Error checking access token:', error.response ? error.response.data : error);
        return false;
    }
}

router.get('/login', (req, res) => {
    const authURL = `https://accounts.spotify.com/authorize?` +
    `client_id=${process.env.SPOTIFY_CLIENT_ID}` +
    `&response_type=code` + 
    `&redirect_uri=${process.env.REDIRECT_URI}` +
    `&scope=user-read-private playlist-read-private`;

    res.json(authURL);
});

router.get('/callback', async (req, res) => {
    const { code } = req.query;
    console.log(req.session.userId);
    try {
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

        const { access_token, refresh_token } = response.data;
        req.session.spotifyAccessToken = access_token;
        await db.query(`UPDATE users SET spotify_refresh_token = $1 WHERE id = $2`, [refresh_token, req.session.userId]);
        console.log('Access token retrieved', access_token);

        res.redirect('/spotify/get-id');

    } catch (error) {
        console.error('Callback error:', error);
        res.status(500).send('Error retrieving acces token');
    }
});

// Get Spotify user id and save in database
router.get('/get-id', async (req, res) => {
    const token = req.session.spotifyAccessToken;

    try {
        const response = await axios.get('https://api.spotify.com/v1/me', {
            headers: { Authorization: `Bearer ${token}` }
        });

        const spotifyId = response.data.id;
        await db.query(`UPDATE users SET spotify_id = $1 WHERE id = $2`, [spotifyId, req.session.userId]);
        console.log('Spotify user id retrieved and saved:', spotifyId);

        res.redirect('http://localhost:5173');
    } catch (error) {
        console.error('Error retrieving Spotify ID:', error.response ? error.response.data : error);
        res.status(500).send('Error retrieving user id');
    }
});

module.exports = {
    router,
    isAccessTokenValid
};