import client from "./client";

// Backed by Trip Service / Destination catalog — a wishlist entry links
// the current user to a destination they've saved for later.

// GET /wishlist — every destination the current user has saved.
export const listWishlist = () => client.get("/wishlist");

// POST /wishlist — save a destination (called from the heart icon on destination cards).
export const addWishlistItem = (destination) =>
  client.post("/wishlist", destination);

// DELETE /wishlist/:itemId — un-save a destination ("Remove" button on the wishlist page).
export const removeWishlistItem = (itemId) =>
  client.delete(`/wishlist/${itemId}`);

// GET /wishlist/suggestions — AI-suggested destinations based on the user's wishlist + trip history.
export const getWishlistSuggestions = (persona) =>
  client.get("/wishlist/suggestions", { params: { persona } });
