const authService = require('../services/authService');

const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const { accessToken, refreshToken } = await authService.login(username, password);
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: 'None',
            maxAge: 7 * 24 * 60 * 60 * 1000
        })
        res.status(200).json({ accessToken });
    } catch (error){
        res.status(401).json({ error: error.message });
    }
};

const refreshToken = async (req, res) => {
    try {
        const accessToken = await authService.refreshToken(req.cookies.refreshToken);
        res.json({ accessToken });
    } catch (error) {
        res.status(403).json({ message: 'Invalid refresh token' });
    }
};

const logout = (req, res) => {
    res.clearCookie('refreshToken');
    res.sendStatus(204);
};

module.exports = { login, refreshToken, logout };