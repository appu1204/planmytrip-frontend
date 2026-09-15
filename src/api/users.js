
import client from "./client";

export const getCurrentUser = () =>
  client.get("/users/me");

export const updateCurrentUser = (payload) =>
  client.put("/users/me", payload);

export const deleteCurrentUser = () =>
  client.delete("/users/me");

export const getTravelCircle = () =>
  client.get("/users/me/travel-circle");

export const getUserStats = () =>
  client.get("/users/me/stats");

export const changePassword = (payload) =>
  client.put("/users/me/change-password", payload);

export const updatePersona = (persona) =>
  client.put("/users/me/persona", { persona });