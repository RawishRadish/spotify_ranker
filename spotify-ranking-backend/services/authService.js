const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Generate JWT tokens
const generateAccessToken = (user) => {
    return jwt.sign({ username: user.username, id: user.id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
};

const generateRefreshToken = (user) => {
    return jwt.sign({ username: user.username, id: user.id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
};

// Find user by username
const getUserByUsername = async (username) => {
    const result = await db.query(`SELECT * FROM users WHERE username = $1`, [username]);
    return result.rows[0];
};

// Login user
const login = async (username, password) => {
    const user = await getUserByUsername(username);

    if (!user || (!await bcrypt.compare(password, user.password))) {
        throw new Error('Invalid username or password');
    }

    return {
        accessToken: generateAccessToken(user),
        refreshToken: generateRefreshToken(user),
    };
};

// Refresh token function
const refreshToken = async (refreshToken) => {
    if (!refreshToken) {
        throw new Error('No refresh token provided');
    }

    return new Promise((resolve, reject) => {
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, user) => {
            if (err) return reject(err);

            const dbUser = await db.query(`SELECT username, id FROM users WHERE id = $1`, [user.id]);

            resolve(generateAccessToken(dbUser.rows[0]));
        });
    });
};

module.exports = { login, refreshToken };