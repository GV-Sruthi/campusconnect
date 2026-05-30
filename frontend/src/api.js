import axios from "axios";

const defaultBaseURL = import.meta.env.VITE_API_URL || "/api";

const api = axios.create({
  baseURL: defaultBaseURL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;


