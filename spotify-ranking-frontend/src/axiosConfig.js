import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000',
    withCredentials: true
});

api.interceptors.response.use(
    response => response,
    async (error) => {
        if (error.response.status === 403) {
            await axios.post('/auth/refresh', {}, { withCredentials: true });
            return api(error.config);
        }
        return Promise.reject(error);
    }
);

export default api;