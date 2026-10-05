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

// POST /itineraries/generate — AI Trip Planner screen: generate a plan BEFORE a trip exists yet
export const generateStandaloneItinerary = (payload) =>
  requestWithFallback(
    () => client.post("/itineraries/generate", payload),
    () => client.post("/api/trip/itineraries/generate", payload)
  );

// POST /trips/:tripId/itinerary/generate — generate a plan for an existing trip
export const generateItinerary = (tripId, payload) =>
  requestWithFallback(
    () => client.post(`/trips/${tripId}/itinerary/generate`, payload),
    () => client.post(`/api/trip/trips/${tripId}/itinerary/generate`, payload)
  );

// GET /trips/:tripId/itinerary — fetch the saved plan
export const getItinerary = (tripId) =>
  requestWithFallback(
    () => client.get(`/trips/${tripId}/itinerary`),
    () => client.get(`/api/trip/trips/${tripId}/itinerary`)
  );

// PUT /trips/:tripId/itinerary — persist the whole plan
export const saveItinerary = (tripId, itinerary) =>
  requestWithFallback(
    () => client.put(`/trips/${tripId}/itinerary`, itinerary),
    () => client.put(`/api/trip/trips/${tripId}/itinerary`, itinerary)
  );

// POST /api/trip/trips/:tripId/itinerary/regenerate — re-run AI generation
export const regenerateItinerary = (tripId, payload) =>
  requestWithFallback(
    () => client.post(`/api/trip/trips/${tripId}/itinerary/regenerate`, payload),
    () => client.post(`/trips/${tripId}/itinerary/regenerate`, payload)
  );

// POST /api/trip/trips/:tripId/itinerary/days — add a new day
export const addItineraryDay = (tripId, day) =>
  requestWithFallback(
    () => client.post(`/api/trip/trips/${tripId}/itinerary/days`, day),
    () => client.post(`/trips/${tripId}/itinerary/days`, day)
  );

// POST /api/trip/trips/:tripId/itinerary/days/:dayId/activities — add an activity to a day
export const addItineraryActivity = (tripId, dayId, activity) =>
  requestWithFallback(
    () => client.post(`/api/trip/trips/${tripId}/itinerary/days/${dayId}/activities`, activity),
    () => client.post(`/trips/${tripId}/itinerary/days/${dayId}/activities`, activity)
  );

// DELETE /api/trip/trips/:tripId/itinerary/days/:dayId/activities/:activityId — remove an activity
export const deleteItineraryActivity = (tripId, dayId, activityId) =>
  requestWithFallback(
    () => client.delete(`/api/trip/trips/${tripId}/itinerary/days/${dayId}/activities/${activityId}`),
    () => client.delete(`/trips/${tripId}/itinerary/days/${dayId}/activities/${activityId}`)
  );

// PATCH /api/trip/trips/:tripId/notes — save trip notes
export const updateTripNotes = (tripId, notes) =>
  requestWithFallback(
    () => client.patch(`/api/trip/trips/${tripId}/notes`, { notes }),
    () => client.patch(`/trips/${tripId}/notes`, { notes })
  );

// GET /api/trip/trips/:tripId/route — stop-by-stop route for map view
export const getTripRoute = (tripId) =>
  requestWithFallback(
    () => client.get(`/api/trip/trips/${tripId}/route`),
    () => client.get(`/trips/${tripId}/route`)
  );

// POST /api/trip/trips/:tripId/route/optimize — ask the backend to optimize stops
export const optimizeTripRoute = (tripId) =>
  requestWithFallback(
    () => client.post(`/api/trip/trips/${tripId}/route/optimize`),
    () => client.post(`/trips/${tripId}/route/optimize`)
  );

// GET /api/trip/trips/:tripId/budget — cost breakdown
export const getTripBudget = (tripId) =>
  requestWithFallback(
    () => client.get(`/api/trip/trips/${tripId}/budget`),
    () => client.get(`/trips/${tripId}/budget`)
  );

