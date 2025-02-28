const spotifyTokenService = require('../services/spotifyTokenService');
const { setSpotifyAccessToken } = require('../config/spotifyConfig');
const db = require('../db');

const getSpotifyAuthURL = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: 'User not authenticated' });
    }
    console.log('User authenticated:', req.user);

    req.session.userId = req.user.id;

    try {
        const authURL = await spotifyService.generateSpotifyAuthUrl();
        res.json({ authURL });
    } catch (error) {
        res.status(500).json({ message: 'Error getting Spotify auth URL' });
        console.log('Error getting Spotify auth URL:', error);
    }
};

const handleSpotifyCallback = async (req, res) => {
    try {
        const { code } = req.query;
        const userId = req.session.userId;
        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated, please reconnect' });
        }
        const tokens = await spotifyTokenService.exchangeCodeForTokens(code);

        if (!tokens.access_token || !tokens.refresh_token) {
            return res.status(400).json({ error: 'No tokens received from Spotify' });
        }

        const spotifyUserId = await spotifyTokenService.getSpotifyUserId(tokens.access_token);

        // Save access token as default for axios requests
        setSpotifyAccessToken(tokens.access_token);

        // Save tokens and Spotify ID in database
        await db.query(
            `UPDATE users
            SET spotify_access_token = $1,
                spotify_refresh_token = $2,
                spotify_id = $3
            WHERE id = $4`, [tokens.access_token, tokens.refresh_token, spotifyUserId, userId]
        );

        res.redirect(process.env.FRONTEND_URL);
    } catch (error) {
        console.error('Callback error:', error);
        res.status(500).send('Error retrieving access token from Spotify');
    }
};

module.exports = { getSpotifyAuthURL, handleSpotifyCallback };