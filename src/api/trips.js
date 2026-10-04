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

export const createTrip = (payload) =>
  requestWithFallback(
    () => client.post("/api/trip/trips", payload),
    () => client.post("/trips", payload)
  );

export const listTrips = ({ userId, status, page = 0, size = 10 } = {}) =>
  requestWithFallback(
    () => client.get("/api/trip/trips", { params: { userId, status, page, size } }),
    () => client.get("/trips", { params: { userId, status, page, size } })
  );

export const getTrip = (tripId) =>
  requestWithFallback(
    () => client.get(`/api/trip/trips/${tripId}`),
    () => client.get(`/trips/${tripId}`)
  );

export const patchTrip = (tripId, payload) =>
  requestWithFallback(
    () => client.patch(`/api/trip/trips/${tripId}`, payload),
    () => client.patch(`/trips/${tripId}`, payload)
  );

export const deleteTrip = (tripId) =>
  requestWithFallback(
    () => client.delete(`/api/trip/trips/${tripId}`),
    () => client.delete(`/trips/${tripId}`)
  );

export const patchTripStatus = (tripId, status) =>
  requestWithFallback(
    () => client.patch(`/api/trip/trips/${tripId}/status`, { status }),
    () => client.patch(`/trips/${tripId}/status`, { status })
  );

export const getTripPreferences = (tripId) =>
  requestWithFallback(
    () => client.get(`/api/trip/trips/${tripId}/preferences`),
    () => client.get(`/trips/${tripId}/preferences`)
  );

export const putTripPreferences = (tripId, payload) =>
  requestWithFallback(
    () => client.put(`/api/trip/trips/${tripId}/preferences`, payload),
    () => client.put(`/trips/${tripId}/preferences`, payload)
  );

export const updateTripStay = (tripId, stay) =>
  requestWithFallback(
    () => client.put(`/api/trip/trips/${tripId}/stay`, stay),
    () => client.put(`/trips/${tripId}/stay`, stay)
  );

// Trip Documents & Booking Vouchers
export const listTripDocuments = (tripId) =>
  requestWithFallback(
    () => client.get(`/api/trip/trips/${tripId}/documents`),
    () => client.get(`/trips/${tripId}/documents`)
  );

export const uploadTripDocument = (tripId, documentData) =>
  requestWithFallback(
    () => client.post(`/api/trip/trips/${tripId}/documents`, documentData),
    () => client.post(`/trips/${tripId}/documents`, documentData)
  );

export const deleteTripDocument = (tripId, documentId) =>
  requestWithFallback(
    () => client.delete(`/api/trip/trips/${tripId}/documents/${documentId}`),
    () => client.delete(`/trips/${tripId}/documents/${documentId}`)
  );

