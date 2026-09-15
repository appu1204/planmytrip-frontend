import client from "./client";

export const getPopularDestinations = (persona, limit = 5) =>
  client.get("/api/trip/popular", {
    params: { persona, limit }
  });