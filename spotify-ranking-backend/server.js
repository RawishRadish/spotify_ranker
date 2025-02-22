require('dotenv').config();

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const pool = require('./db');
const app = express();
const { router: spotAuthRoute } = require('./routes/spotify_authorization');
const playlistRoute = require('./routes/playlists');
const rankingRoute = require('./routes/ranking');
const userAuthRoutes = require('./routes/authRoutes');

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));



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

app.use('/api', playlistRoute);
app.use('/spotify', spotAuthRoute);
app.use('/api', rankingRoute);
app.use('/auth', userAuthRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
});