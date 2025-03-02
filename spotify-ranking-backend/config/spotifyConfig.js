const axios = require('axios');

// Create axios instance for Spotify API
const spotifyApi = axios.create({
    baseURL: 'https://api.spotify.com/v1',
    withCredentials: true
});

// Add access token to request headers
const setSpotifyAccessToken = (token) => {
    if (token) {
        spotifyApi.defaults.headers.common['Authorization'] = `Bearer ${token}`;
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
                console.log('Trying to refresh Spotify access token');
                const userId = originalRequest.headers['X-User-ID'];
                const { data } = await axios.get('http://localhost:3000/spotify/refresh', {
                    headers: {
                        'X-User-ID': userId
                    }
                });
                console.log('New access token:', data.accessToken);
                setSpotifyAccessToken(data.accessToken);
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