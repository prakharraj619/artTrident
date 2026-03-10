import axios from 'axios';

const apiClient = axios.create({
    baseURL: 'http://localhost:8080/api/v1'
});

apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log(`[APIClient] Outgoing Request to ${config.url} WITH token attached.`);
    } else {
        console.warn(`[APIClient] Outgoing Request to ${config.url} MISSING token.`);
    }
    return config;
});

apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            // Token is likely expired or invalid
            console.warn('[APIClient] 401/403 Unauthorized detected. Clearing token and redirecting to login.');
            const hasToken = localStorage.getItem('token');
            if (hasToken) {
                localStorage.removeItem('token');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default apiClient;
