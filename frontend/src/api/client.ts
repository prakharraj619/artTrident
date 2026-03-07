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

export default apiClient;
