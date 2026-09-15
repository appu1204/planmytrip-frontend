
import axios from "axios";

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const client = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach access token
client.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("pmt_token");

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Handle API responses
client.interceptors.response.use(
  (response) => {
    return response.data?.data ?? response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("pmt_token");
      localStorage.removeItem("pmt_user");
    }

    const message =
      error.response?.data?.data?.message ||
      error.response?.data?.message ||
      error.response?.data?.data?.error ||
      error.response?.data?.error ||
      error.message ||
      "Something went wrong. Please try again.";

    return Promise.reject({
      ...error,
      message,
    });
  }
);

export default client;
