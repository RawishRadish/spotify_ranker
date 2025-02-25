const express = require('express');
const axios = require('axios');
const router = express.Router();
const jwt = require('jsonwebtoken');
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
    

    res.json(authURL);
});

router.get('/callback', async (req, res) => {
    const { code } = req.query;
    const decodedUserToken = jwt.verify(req.cookies.accessToken, process.env.ACCESS_TOKEN_SECRET);
    console.log('User token used in callback:', decodedUserToken);
    const userId = decodedUserToken.id;
    console.log('User ID used in callback:', userId);

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

        res.cookie('spotifyAccessToken', access_token, {
            httpOnly: true, secure: false, sameSite: 'None'
        });

        await db.query(`UPDATE users SET spotify_refresh_token = $1 WHERE id = $2`, [refresh_token, userId]);
        console.log('Access token retrieved', access_token);

        res.redirect('/spotify/get-id');

    } catch (error) {
        console.error('Callback error:', error);
        res.status(500).send('Error retrieving acces token');
    }
});

// Get Spotify user id and save in database
router.get('/get-id', async (req, res) => {
    const spotifyToken = req.cookies.spotifyAccessToken;
    const decodedUserToken = jwt.verify(req.cookies.accessToken, process.env.ACCESS_TOKEN_SECRET);
    const userId = decodedUserToken.id;

    try {
        const response = await axios.get('https://api.spotify.com/v1/me', {
            headers: { Authorization: `Bearer ${spotifyToken}` }
        });

        const spotifyId = response.data.id;
        await db.query(`UPDATE users SET spotify_id = $1 WHERE id = $2`, [spotifyId, userId]);
        console.log('Spotify user id retrieved and saved:', spotifyId);
        console.log('On user:', userId);

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