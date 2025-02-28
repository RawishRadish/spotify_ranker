const axios = require('axios');
const { getSpotifyRefreshToken, updateSpotifyTokens } = require('../services/spotifyTokenService');

const spotifyApi = axios.create({
});

// Add access token to request headers
const setSpotifyAccessToken = (token) => {
    if (token) {
        spotifyApi.defaults.headers.common['Authorization'] = `Bearer $(token)`;
    } else {
        delete spotifyApi.defaults.headers.common['Authorization'];
    }
};

// Refresh access token if expired
let isRefreshing = false; // Flag to prevent multiple refresh requests

spotifyApi.interceptors.response.use(
    (response) => response, // Return a successful response
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !isRefreshing) {
            isRefreshing = true;
            try {
                const accessToken = originalRequest.headers['Authorization'].split(' ')[1];
                const oldRefreshToken = await getSpotifyRefreshToken(accessToken);

                console.log('Trying to refresh access token using refresh token:', refreshToken);
                const params = new URLSearchParams();
                params.append('grant_type', 'refresh_token');
                params.append('refresh_token', oldRefreshToken);

                const { data } = await axios.post('https://accounts.spotify.com/api/token', params, {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Authorization': 'Basic ' + (new Buffer.from(PROCESS.ENV.SPOTIFY_CLIENT_ID + ':' + PROCESS.ENV.SPOTIFY_CLIENT_SECRET).toString('base64'))
                    }
                });

                const newAccessToken = data.access_token;
                const newRefreshToken = data.refresh_token;

                await updateSpotifyTokens(newAccessToken, newRefreshToken, oldRefreshToken);
                setSpotifyAccessToken(newAccessToken);
                
                isRefreshing = false;
                return spotifyApi(originalRequest);
            } catch (error) {
                console.error('Error refreshing access token:', error);
                isRefreshing = false;
                return Promise.reject(error);
            }
        }
        return Promise.reject(error);
    }
);

module.exports = {
    spotifyApi,
    setSpotifyAccessToken
};