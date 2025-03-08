import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000',
    withCredentials: true
});

// Add access token to request headers
export const setAuthToken = (token) => {
    if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete api.defaults.headers.common['Authorization'];
    }
};

// Refresh access token if expired

let isRefreshing = false; // Flag to prevent multiple refresh requests

api.interceptors.response.use(
    (response) => response, // Return a successful response
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !isRefreshing) {
            isRefreshing = true;
            try {
                console.log('Trying to refresh access token');
                const { data } = await api.post('/auth/refresh');
                console.log('New access token:', data.accessToken);
                setAuthToken(data.accessToken);
                originalRequest.headers['Authorization'] = `Bearer ${data.accessToken}`;
                isRefreshing = false;
                return api.request(originalRequest);
            } catch (refreshError) {
                isRefreshing = false;
                console.error('Session expired. Please log in again.');
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default api;