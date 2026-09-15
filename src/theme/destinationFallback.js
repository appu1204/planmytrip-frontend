// Shown only if GET /popular hasn't been wired up yet or the call fails,
// so the Home page never renders empty during backend integration.
export const FALLBACK_DESTINATIONS = {
  family: [
    { id: "kerala", name: "Kerala", country: "India" },
    { id: "singapore", name: "Singapore", country: "Singapore" },
    { id: "maldives", name: "Maldives", country: "Maldives" },
    { id: "switzerland", name: "Switzerland", country: "Switzerland" },
    { id: "thailand", name: "Thailand", country: "Thailand" },
  ],
  adventure: [
    { id: "leh-ladakh", name: "Leh Ladakh", country: "India" },
    { id: "nepal", name: "Nepal", country: "Nepal" },
    { id: "manali", name: "Manali", country: "India" },
    { id: "rishikesh", name: "Rishikesh", country: "India" },
    { id: "queenstown", name: "Queenstown", country: "New Zealand" },
  ],
  friends: [
    { id: "goa", name: "Goa", country: "India" },
    { id: "dubai", name: "Dubai", country: "UAE" },
    { id: "bangkok", name: "Bangkok", country: "Thailand" },
    { id: "barcelona", name: "Barcelona", country: "Spain" },
    { id: "queenstown", name: "Queenstown", country: "New Zealand" },
  ],
  solo: [
    { id: "ladakh", name: "Ladakh", country: "India" },
    { id: "bali", name: "Bali", country: "Indonesia" },
    { id: "switzerland", name: "Switzerland", country: "Switzerland" },
    { id: "kyoto", name: "Kyoto", country: "Japan" },
    { id: "santorini", name: "Santorini", country: "Greece" },
  ],
  couple: [
    { id: "santorini", name: "Santorini", country: "Greece" },
    { id: "bali", name: "Bali", country: "Indonesia" },
    { id: "maldives", name: "Maldives", country: "Maldives" },
    { id: "paris", name: "Paris", country: "France" },
    { id: "venice", name: "Venice", country: "Italy" },
  ],
};
