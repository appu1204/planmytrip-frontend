// Shown only until GET /wishlist, GET /users/me/circle and
// GET /notifications are live — same "never render empty" pattern as
// theme/destinationFallback.js.

export const FALLBACK_WISHLIST = [
  { id: "santorini", name: "Santorini", country: "Greece", category: "Beach", perPerson: 92000, nights: 7 },
  { id: "singapore", name: "Singapore", country: "Singapore", category: "City", perPerson: 68500, nights: 5 },
  { id: "maldives", name: "Maldives", country: "Maldives", category: "Beach", perPerson: 135000, nights: 6 },
  { id: "switzerland", name: "Switzerland", country: "Switzerland", category: "Mountains", perPerson: 158000, nights: 8 },
];

export const WISHLIST_CATEGORIES = ["All", "Beach", "City", "Mountains"];

export const FALLBACK_CIRCLE = [
  { id: "me", name: "You", role: "Trip organiser" },
  { id: "member-2", name: "Riya Sharma", role: "Partner" },
  { id: "member-3", name: "Aryan", role: "Child" },
  { id: "member-4", name: "Meera", role: "Child" },
];
