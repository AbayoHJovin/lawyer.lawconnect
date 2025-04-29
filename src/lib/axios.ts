import axios from "axios";
const API = axios.create({
  baseURL: "http://localhost:5000/api/v1",
  withCredentials: true, // Always send cookies for authentication
});

// Clean request interceptor: no manual Authorization header
API.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

// Add a response interceptor
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If the error is 401, redirect to login
    if (error.response?.status === 401) {
        window.location.href = "/login";
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default API;
