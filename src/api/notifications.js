import client from "./client";

// Maps to Notification Service in the architecture doc.

// GET /notifications — the current user's notification feed, newest first.
export const listNotifications = () => client.get("/notifications").then((res) => res.data);

// PATCH /notifications/read-all — clear the unread badge shown on Profile / Navbar.
export const markAllNotificationsRead = () =>
  client.patch("/notifications/read-all").then((res) => res.data);

// GET /notifications/preferences — which notification channels/types are currently on.
export const getNotificationPreferences = () =>
  client.get("/notifications/preferences").then((res) => res.data);

// PUT /notifications/preferences — save the on/off toggles from the Profile settings panel.
export const updateNotificationPreferences = (payload) =>
  client.put("/notifications/preferences", payload).then((res) => res.data);
