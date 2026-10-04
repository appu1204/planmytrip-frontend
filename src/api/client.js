
import axios from "axios";

export const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
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

// Format and normalize error responses
function extractErrorMessage(error) {
  if (!error.response) {
    if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
      return "Request timed out. Please verify the backend server is reachable and try again.";
    }
    if (error.message === "Network Error") {
      return "Unable to connect to the server. Please check your network connection or backend status.";
    }
    return error.message || "Network error. Please try again.";
  }

  const data = error.response.data;

  // Spring Boot / Express validation error arrays: { errors: [ { defaultMessage: "..." } ] } or { errors: [ "..." ] }
  if (Array.isArray(data?.errors) && data.errors.length > 0) {
    const first = data.errors[0];
    return typeof first === "string" ? first : first.defaultMessage || first.message || JSON.stringify(first);
  }

  // Field error objects: { errors: { email: "Invalid format", password: "Too short" } }
  if (data?.errors && typeof data.errors === "object") {
    const firstKey = Object.keys(data.errors)[0];
    if (firstKey) {
      const val = data.errors[firstKey];
      return Array.isArray(val) ? val[0] : String(val);
    }
  }

  return (
    data?.data?.message ||
    data?.message ||
    data?.data?.error ||
    data?.error ||
    data?.detail ||
    data?.title ||
    error.message ||
    "Something went wrong. Please try again."
  );
}

// Handle API responses
client.interceptors.response.use(
  (response) => {
    return response.data?.data ?? response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      const hadToken = Boolean(localStorage.getItem("pmt_token"));
      localStorage.removeItem("pmt_token");
      localStorage.removeItem("pmt_user");

      if (hadToken && typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("pmt-auth-unauthorized"));
      }
    }

    const message = extractErrorMessage(error);

    return Promise.reject({
      ...error,
      message,
      statusCode: error.response?.status,
    });
  }
);

export default client;

