import client from "./client";

export const createTrip = (payload) =>
  client.post("/api/trip/trips", payload);

export const listTrips = ({ userId, status, page = 0, size = 10 } = {}) =>
  client.get("/api/trip/trips", {
    params: { userId, status, page, size }
  });

export const getTrip = (tripId) =>
  client.get(`/api/trip/trips/${tripId}`);

export const patchTrip = (tripId, payload) =>
  client.patch(`/api/trip/trips/${tripId}`, payload);

export const deleteTrip = (tripId) =>
  client.delete(`/api/trip/trips/${tripId}`);

export const patchTripStatus = (tripId, status) =>
  client.patch(`/api/trip/trips/${tripId}/status`, { status });

export const getTripPreferences = (tripId) =>
  client.get(`/api/trip/trips/${tripId}/preferences`);

export const putTripPreferences = (tripId, payload) =>
  client.put(`/api/trip/trips/${tripId}/preferences`, payload);
