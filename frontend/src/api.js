// Use axios browser build to avoid Node 'http' adapter in webpack
import axios from 'axios';

const api = axios.create({ baseURL: 'http://198.168.1.42:4000' });

api.interceptors.request.use((config) => {
	const token = localStorage.getItem('token');
	if (token) {
		config.headers.Authorization = `Bearer ${token}`;
	}
	return config;
});

export default api;


