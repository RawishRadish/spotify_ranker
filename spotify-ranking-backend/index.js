require('dotenv').config();
const axios = require('axios');
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const pool = require('./db');
const app = express();
const { router: spotAuthRoute } = require('./routes/spotify_authorization');
const playlistRoute = require('./routes/playlists');
const rankingRoute = require('./routes/ranking');
const userAuthRoute = require('./routes/user_authorization');

app.use(express.json());
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));
app.use(session({
    name: 'spotify-ranking-sessioniali',
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

const PORT = process.env.PORT || 3000;

console.log(process.env.SPOTIFY_CLIENT_ID);
console.log(process.env.SPOTIFY_CLIENT_SECRET);
console.log(process.env.REDIRECT_URI);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
});

app.get('/', (req, res) => {
    res.send('Welcome to the Spotify Ranking API');
});

app.get('/test-db', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()');
        res.json(result.rows);
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).send('Database error');
    }
});

app.get('/api/playlists/:playlistId/random', async (req, res) => {
    const { playlistId } = req.params;

    try {
        const result = await pool.query('SELECT * FROM songs WHERE playlist_id = $1 ORDER BY RANDOM() LIMIT 2', [playlistId]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching songs', error);
        res.status(500).send('Error fetching songs');
    }
});

app.use('/api', playlistRoute);
app.use('/spotify', spotAuthRoute);
app.use('/api', rankingRoute);
app.use('/auth', userAuthRoute);
