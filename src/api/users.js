
import client from "./client";

async function requestWithFallback(primaryFn, fallbackFn) {
  try {
    return await primaryFn();
  } catch (err) {
    if (err?.statusCode === 404 && fallbackFn) {
      return await fallbackFn();
    }
    throw err;
  }
}

// User Profile
export const getCurrentUser = () =>
  requestWithFallback(
    () => client.get("/api/user/me"),
    () => client.get("/users/me")
  );

export const updateCurrentUser = (payload) =>
  requestWithFallback(
    () => client.put("/api/user/me", payload),
    () => client.put("/users/me", payload)
  );

export const deleteCurrentUser = () =>
  requestWithFallback(
    () => client.delete("/api/user/me"),
    () => client.delete("/users/me")
  );

// Travel Circle
export const getTravelCircle = () =>
  requestWithFallback(
    () => client.get("/api/user/travel-circle"),
    () => client.get("/users/me/travel-circle")
  );

export const addTravelCircleMember = (payload) =>
  requestWithFallback(
    () => client.post("/api/user/travel-circle", payload),
    () => client.post("/users/me/travel-circle", payload)
  );

export const removeTravelCircleMember = (memberId) =>
  requestWithFallback(
    () => client.delete(`/api/user/travel-circle/${memberId}`),
    () => client.delete(`/users/me/travel-circle/${memberId}`)
  );

// User Stats
export const getUserStats = () =>
  requestWithFallback(
    () => client.get("/api/user/stats"),
    () => client.get("/users/me/stats")
  );

// Security & Persona
export const changePassword = (payload) =>
  requestWithFallback(
    () => client.put("/api/user/change-password", payload),
    () => client.put("/users/me/change-password", payload)
  );

export const updatePersona = (persona) =>
  requestWithFallback(
    () => client.put("/api/user/persona", { persona }),
    () => client.put("/users/me/persona", { persona })
  );

// Newsletter / Coming Soon feature interest subscription
export const subscribeNewsletter = (payload) =>
  requestWithFallback(
    () => client.post("/api/user/newsletter/subscribe", payload),
    () => client.post("/api/notification/subscribe", payload)
  );