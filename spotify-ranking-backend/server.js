require('dotenv').config();

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const pool = require('./db');
const app = express();
const playlistRoutes = require('./routes/playlistRoutes');
const compareRoutes = require('./routes/compareRoutes');
const userAuthRoutes = require('./routes/authRoutes');
const spotifyAuthRoutes = require('./routes/spotifyAuthRoutes');
const { authenticateToken } = require('./middlewares/authMiddleware');

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));
app.use(session({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false,
    resave: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24,
        secure: false 
    } // secure: true in production
}));



app.get('/', (req, res) => {
    res.send('Welcome to the Spotify Ranking API');
    console.log(req.session);
    console.log(req.session.id);
});

app.get('/session-test', (req, res) => {
    req.session.test = 'Hello, session!';
    res.send('Session set');
})

app.get('/test-db', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()');
        res.json(result.rows);
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).send('Database error');
    }
});

app.get('/test-auth', authenticateToken, (req, res) => {
    res.json(req.user);
});


app.use('/playlists', playlistRoutes);
app.use('/spotify', spotifyAuthRoutes);
app.use('/pairs', compareRoutes);
app.use('/auth', userAuthRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
});