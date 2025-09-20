// src/api.js
import axios from "axios";
import { API_URL } from "./constants";

const api = axios.create({
  baseURL: API_URL, // replace with your backend URL
});

// Add Authorization header for each request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // or sessionStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
