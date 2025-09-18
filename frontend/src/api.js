// Use axios browser build to avoid Node 'http' adapter in webpack
import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:4000' });

api.interceptors.request.use((config) => {
	const token = localStorage.getItem('token');
	if (token) {
		config.headers.Authorization = `Bearer ${token}`;
	}
	return config;
});

// Utility function for consistent timezone-aware date formatting
export const formatDateForAPI = (date) => {
	// Use local timezone to avoid date shifting
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
};

export default api;


