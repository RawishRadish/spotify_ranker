const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authenticateToken = require('./authMiddleware');


// User registration
router.post('/register', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Check if user exists
        const userExists = await db.query(`SELECT * FROM users WHERE username = $1`, [username]);
        if (userExists.rowCount > 0) {
            return res.status(400).send('User already exists');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user into database
        await db.query(`INSERT INTO users (username, password) VALUES ($1, $2)`, [username, hashedPassword]);

        res.status(201).json({ message: 'Gebruiker succesvol geregistreerd' });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Interne serverfout' });
    }
});

const generateTokens = (user) => {
// Generate JWT access token
const accessToken = jwt.sign(
        { username: user.username, id: user.id },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '15m' } //Short life span
    );

// Generate JWT Refresh token
const refreshToken = jwt.sign(
        { username: user.username, id: user.id },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '7d' } //Long life span
    );

    return { accessToken, refreshToken };
};

// User login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Check if user exists
        const user = await db.query(`SELECT * FROM users WHERE username = $1`, [username]);

        if (!user) {
            return res.status(400).send('Invalid username');
        }

        // Check if password is correct
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(400).send('Invalid password');
        }

        // Generate tokens
        const tokens = generateTokens(user);
        const { accessToken, refreshToken } = tokens;

        // Save refresh token in database
        await db.query(`UPDATE users SET user_refresh_token = $1 WHERE id = $2`, [refreshToken, user.id]);

        // Send access token in cookie
        res.cookie('accessToken', accessToken, {
            httpOnly: true, secure: true, sameSite: 'strict', maxAge: 15 * 60 * 1000
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true, secure: true, sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.json({ 
            message: 'Je bent nu ingelogd <3',
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).send('Login error');
    }
});

// User logout
router.post('/logout', async (req, res) => {
    try {
        //Remove refresh token from database
        const refreshToken = req.cookies.refreshToken;
        await db.query(`UPDATE users SET user_refresh_token = NULL WHERE user_refresh_token = $1`, [refreshToken]);

        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');
        // res.clearCookie('spotify-ranking-sessioniali');
        res.status(200).json({ message: 'Je bent nu uitgelogd' });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ message: 'Fout bij uitloggen' });
    }
});

// Check if user is authenticated
router.get('/check-auth', (req, res) => {
    try {
        const token = req.cookies.accessToken;
        if (!token) {
            return res.status(401).send('Not logged in');
        }
    
        //Verify access token
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
            if (err) {
                return res.status(403).send('Invalid or expired access token');
            }
            res.status(200).json({ message: 'Ingelogd' });
        });
    } catch (error) {
        console.error('Check auth error:', error);
        res.status(500).send('Check auth error');
    }
});

// Refresh token route
router.post('/refresh', async (req, res) => {
    try{
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) return res.status(403).json({ error: 'Refresh token missing' });
    
        //Search for refresh token in database
        const user = await db.query(`SELECT * FROM users WHERE user_refresh_token = $1`, [refreshToken]);
    
        if (!user) return res.status(403).json({ error: 'Invalid refresh token' });
    
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
            if (err) return res.status(403).json({ error: 'Invalid or expired refresh token' });
    
            const newTokens = generateTokens(user);
            res.cookie('accessToken', newTokens.accessToken, {
                httpOnly: true, secure: true, sameSite: 'strict', maxAge: 15 * 60 * 1000
            });
    
            res.json({ accessToken: newTokens.accessToken });
        });
    } catch (error) {
        console.error('Refresh token error:', error);
        res.status(500).json({ error: 'Refresh token error' });
    }
});

module.exports = router;