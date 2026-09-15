
import client from "./client";

export const registerUser = (payload) =>
  client.post("/api/user/auth/register", payload);

export const loginUser = (payload) =>
  client.post("/api/user/auth/login", payload);

export const verifyOtp = (payload) =>
  client.post("/api/user/auth/verify-otp", payload);

export const resendOtp = (payload) =>
  client.post("/api/user/auth/resend-otp", payload);

export const forgotPassword = (payload) =>
  client.post("/api/user/auth/forgot-password", payload);

export const resetPassword = (payload) =>
  client.post("/api/user/auth/reset-password", payload);

export const verifyEmail = (token) =>
  client.get("/api/user/auth/verify-email", {
    params: { token },
  });

