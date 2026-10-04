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

// GET /api/notification/notifications — feed, newest first
export const listNotifications = () =>
  requestWithFallback(
    () => client.get("/api/notification/notifications"),
    () => client.get("/notifications")
  );

// PATCH /api/notification/read-all — clear unread badge
export const markAllNotificationsRead = () =>
  requestWithFallback(
    () => client.patch("/api/notification/read-all"),
    () => client.patch("/notifications/read-all")
  );

// GET /api/notification/preferences — channel preferences
export const getNotificationPreferences = () =>
  requestWithFallback(
    () => client.get("/api/notification/preferences"),
    () => client.get("/notifications/preferences")
  );

// PUT /api/notification/preferences — save channel preferences
export const updateNotificationPreferences = (payload) =>
  requestWithFallback(
    () => client.put("/api/notification/preferences", payload),
    () => client.put("/notifications/preferences", payload)
  );

