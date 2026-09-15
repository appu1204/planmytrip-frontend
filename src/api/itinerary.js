import client from "./client";

// client interceptor already unwraps axios responses (response.data?.data ?? response.data).
// Helper to safely extract payload without returning undefined if .data is not a property.
const unwrap = (res) => (res && typeof res === "object" && "data" in res && res.data !== undefined ? res.data : res);

// POST /itineraries/generate — AI Trip Planner screen: generate a plan BEFORE a trip exists yet (no tripId).
export const generateStandaloneItinerary = (payload) =>
  client.post("/itineraries/generate", payload).then(unwrap);

// POST /trips/:tripId/itinerary/generate — generate a plan for a trip that's already been created.
export const generateItinerary = (tripId, payload) =>
  client.post(`/trips/${tripId}/itinerary/generate`, payload).then(unwrap);

// GET /trips/:tripId/itinerary — fetch the saved plan (days, activities, notes) for the itinerary builder screen.
export const getItinerary = (tripId) =>
  client.get(`/trips/${tripId}/itinerary`).then(unwrap);

// PUT /trips/:tripId/itinerary — persist the whole plan after the user edits it (used by "Save to my trip").
export const saveItinerary = (tripId, itinerary) =>
  client.put(`/trips/${tripId}/itinerary`, itinerary).then(unwrap);

// POST /trips/:tripId/itinerary/regenerate — re-run AI generation, optionally with tweaked preferences.
export const regenerateItinerary = (tripId, payload) =>
  client.post(`/trips/${tripId}/itinerary/regenerate`, payload).then(unwrap);

// POST /trips/:tripId/itinerary/days — add a new empty day to the itinerary (the "+ Add day" button).
export const addItineraryDay = (tripId, day) =>
  client.post(`/trips/${tripId}/itinerary/days`, day).then(unwrap);

// POST /trips/:tripId/itinerary/days/:dayId/activities — add one activity/stop to a specific day.
export const addItineraryActivity = (tripId, dayId, activity) =>
  client
    .post(`/trips/${tripId}/itinerary/days/${dayId}/activities`, activity)
    .then(unwrap);

// DELETE /trips/:tripId/itinerary/days/:dayId/activities/:activityId — remove one activity from a day.
export const deleteItineraryActivity = (tripId, dayId, activityId) =>
  client
    .delete(`/trips/${tripId}/itinerary/days/${dayId}/activities/${activityId}`)
    .then(unwrap);

// PATCH /trips/:tripId/notes — save the free-text "Trip notes" box shown next to the day timeline.
export const updateTripNotes = (tripId, notes) =>
  client.patch(`/trips/${tripId}/notes`, { notes }).then(unwrap);

// GET /trips/:tripId/route — stop-by-stop route (used by Map view); usually derived server-side from the itinerary.
export const getTripRoute = (tripId) =>
  client.get(`/trips/${tripId}/route`).then(unwrap);

// POST /trips/:tripId/route/optimize — ask the backend to reorder/optimize stops for shortest travel time.
export const optimizeTripRoute = (tripId) =>
  client.post(`/trips/${tripId}/route/optimize`).then(unwrap);

// GET /trips/:tripId/budget — the cost-breakdown shown on the itinerary "Budget" tab (stays/activities/transport).
export const getTripBudget = (tripId) =>
  client.get(`/trips/${tripId}/budget`).then(unwrap);
