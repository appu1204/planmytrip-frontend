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

// GET /api/trip/wishlist — every destination the current user has saved.
export const listWishlist = () =>
  requestWithFallback(
    () => client.get("/api/trip/wishlist"),
    () => client.get("/wishlist")
  );

// POST /api/trip/wishlist — save a destination
export const addWishlistItem = (destination) =>
  requestWithFallback(
    () => client.post("/api/trip/wishlist", destination),
    () => client.post("/wishlist", destination)
  );

// DELETE /api/trip/wishlist/:itemId — un-save a destination
export const removeWishlistItem = (itemId) =>
  requestWithFallback(
    () => client.delete(`/api/trip/wishlist/${itemId}`),
    () => client.delete(`/wishlist/${itemId}`)
  );

// GET /api/trip/wishlist/suggestions — AI-suggested destinations
export const getWishlistSuggestions = (persona) =>
  requestWithFallback(
    () => client.get("/api/trip/wishlist/suggestions", { params: { persona } }),
    () => client.get("/wishlist/suggestions", { params: { persona } })
  );

