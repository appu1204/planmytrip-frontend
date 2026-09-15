import { Plane, Building2, Compass, Car } from "lucide-react";

// Each key matches a route (/flights, /hotels, /activities, /transport)
// and a video file this page will look for at
// `/videos/coming-soon-<key>.mp4`. Nothing else needs to change when you
// add real search UI here later — just delete the route override in
// App.jsx and point it at the real page.
export const COMING_SOON_CONTENT = {
  flights: {
    key: "flights",
    icon: Plane,
    eyebrow: "Booking Service · Flights",
    title: "Flight search is on its way",
    subcopy:
      "We're wiring up real-time fares, layovers and seat picks so you can book a flight the same place you planned the trip.",
    checklist: [
      "Compare fares across airlines in one search",
      "Filter by stops, duration and departure time",
      "Book and get your confirmation instantly",
    ],
  },
  hotels: {
    key: "hotels",
    icon: Building2,
    eyebrow: "Booking Service · Hotels",
    title: "Hotel booking is on its way",
    subcopy:
      "Verified stays, family-safe filters and free-cancellation options are being connected right now.",
    checklist: [
      "Filter by kid-friendly, pet-friendly or accessible rooms",
      "See real guest ratings before you commit",
      "Free cancellation clearly marked on every stay",
    ],
  },
  activities: {
    key: "activities",
    icon: Compass,
    eyebrow: "Booking Service · Activities",
    title: "Activities & tours are on their way",
    subcopy:
      "Curated experiences for every trip type — from quiet local walks to full-day adventures — are being added.",
    checklist: [
      "Book tours and experiences by the day",
      "See what fits your trip's pace and persona",
      "Reschedule or cancel without the back-and-forth",
    ],
  },
  transport: {
    key: "transport",
    icon: Car,
    eyebrow: "Booking Service · Transport",
    title: "Local transport is on its way",
    subcopy:
      "Airport transfers, intercity cabs and self-drive options — all bookable from inside your itinerary.",
    checklist: [
      "Pre-book airport & hotel transfers",
      "Compare cab, train and self-drive options",
      "Transport shows up automatically in your itinerary",
    ],
  },
};
