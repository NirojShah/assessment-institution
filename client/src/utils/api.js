import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const userString = localStorage.getItem('edumerge_user');
    if (userString) {
      const user = JSON.parse(userString);
      if (user.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
