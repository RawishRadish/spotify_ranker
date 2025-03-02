const authService = require('../services/authService');
const { setSpotifyAccessToken } = require('../config/spotifyConfig');

const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const { accessToken, refreshToken, userId } = await authService.login(username, password);
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: 'None',
            maxAge: 7 * 24 * 60 * 60 * 1000
        })
        res.status(200).json({ accessToken, username });
    } catch (error){
        res.status(401).json({ error: error.message });
    }
};

const refreshUserToken = async (req, res) => {
    try {
        const { accessToken, refreshToken, username, } = await authService.refreshUserToken(req.cookies.refreshToken);
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: 'None',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        res.json({ accessToken, username });
    } catch (error) {
        res.status(403).json({ message: 'Invalid refresh token' });
    }
};

const logout = async (req, res) => {
    const refreshToken = req.cookies?.refreshToken;

    await authService.logout(refreshToken);
    req.session.destroy();
    res.clearCookie('refreshToken');
    setSpotifyAccessToken(null);
    res.sendStatus(204);
};

module.exports = { login, refreshUserToken, logout };