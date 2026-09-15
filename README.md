# PlanMyTrip — Frontend

React (Vite) + Tailwind frontend for PlanMyTrip, matching all 10 screens
in `PlanMyTrip_Architecture.pdf`. Built in phases on top of your
previous uploads (auth, home, trip creation) — this pass adds the
itinerary builder, map view, wishlist, AI planner, and profile.

## Setup

```bash
npm install
cp .env.example .env      # then set VITE_API_BASE_URL to your API gateway
npm run dev
```

Open `http://localhost:5173`. There's no real backend wired in yet, so
every page falls back to realistic sample data the moment an API call
fails — you can click through the entire app with `npm run dev` alone.

## How to test each screen

You don't need a backend running to see every screen — each API call
below is written to fail gracefully and fall back to sample data (look
for `.catch()` in the page source if you want to see exactly where).

| # | Screen | Route | Try this |
|---|--------|-------|----------|
| 01 | Register | `/register` | Fill the form, submit — calls `POST /auth/register` |
| 02 | Sign in | `/login` | Any credentials — calls `POST /auth/login` |
| 03 | Persona onboarding | `/onboarding/persona` | Pick Adventure/Solo/Couple/Friends/Family, watch the color theme switch instantly |
| 04 | Home | `/home` | Hero photo + copy + destination rail all change per persona |
| 05 | Create a trip | `/trips/new` | Fill in dates/travellers, watch the live cost estimate update |
| 06 | Itinerary builder | `/trips/:tripId` (Itinerary tab) | Click a day in the left list, add/remove activities, click "Add to itinerary" on the AI suggestion card |
| 07 | Map view | `/trips/:tripId` (Map tab) | Stylised route auto-builds from your itinerary days; try "Optimise route" |
| 08 | Wishlist | `/wishlist` | Filter by category, "Plan trip" pre-fills Create Trip with that destination |
| 09 | AI trip planner | `/planner` | Set preferences, "Generate my itinerary", then "Save to my trip" — this actually creates a trip via `POST /trips` |
| 10 | Profile | `/profile` | Stats, recent trips, travel circle, notifications panel, edit profile, delete account |

The fastest way to reach 06/07 is: Home → "New trip" → fill the form →
"Create trip & build itinerary" → you land straight on the Itinerary tab.

## Wiring up your real backend

1. Set `VITE_API_BASE_URL` in `.env` to your API gateway.
2. Every request in `src/api/*.js` already targets the REST paths your
   architecture implies (`/auth/*`, `/users/*`, `/trips/*`,
   `/trips/:id/itinerary/*`, `/wishlist/*`, `/notifications/*`). Rename
   paths there if your gateway differs — nothing else needs to change,
   every page imports these functions instead of calling `axios`/`fetch`
   directly.
3. Response shape expectations live next to each fallback: see
   `src/utils/itineraryFallback.js` (`{ days: [{ id, index, label,
   dateLabel, activities: [...] }] }`) and `src/theme/wishlistFallback.js`.
   Match those shapes (or adjust the `.then()` mapping in the page) and
   the fallback data disappears automatically once your endpoint responds.
4. `src/api/client.js` reads a token from `localStorage` under
   `pmt_token` and attaches it as `Authorization: Bearer <token>` on
   every request — set that key on login/register success (already done
   in `AuthContext.login`).

## Adding your persona photos

Background photos are never baked with text — every headline/badge you
see is rendered by React on top of the photo. Drop plain photos into
`public/images/`, named exactly:

```
hero-family.jpg
hero-adventure.jpg
hero-friends.jpg
hero-solo.jpg
hero-couple.jpg
```

Four of these (`hero-adventure.jpg`, `hero-family.jpg`,
`hero-friends.jpg`, `hero-solo.jpg`) are already filled in from the
reference images you uploaded — swap them for real photography anytime.
`hero-couple.jpg` doesn't exist yet, so that persona shows a brand-color
gradient until you add one. If a photo is missing, the gradient fallback
always keeps the layout from breaking.

## Folder map

```
src/
  api/          axios client + one file per backend service
    client.js        shared axios instance, auth header, error normalizing
    auth.js           /auth/* — register, login, otp, password reset, verify email
    users.js          /users/me* — profile, persona, delete account, travel circle, stats
    trips.js          /trips* — CRUD + status + preferences (Trip Service)
    itinerary.js       /trips/:id/itinerary*, /itineraries/generate (AI Itinerary Service)
    wishlist.js        /wishlist* — saved destinations + AI suggestions
    notifications.js   /notifications* — feed + on/off preferences (Notification Service)
    destinations.js    /popular — persona-ranked destination rail on Home

  context/      AuthContext — token + user + persona state, read by every protected page
  theme/        persona copy/colors config (personas.js) + fallback sample data
  utils/        currency/date formatting, client-side cost estimate, fallback itinerary builder

  components/
    ui/         Button, Input, PasswordInput, SocialButton, Logo, Badge
    layout/     AuthLayout, AuthCard, Navbar, ProtectedRoute
    home/       SearchBar, QuickActions, DestinationCard, FeatureCard, TrustBadge
    trip/       Counter, TripTypeSelector, CostEstimateCard, TripTipCard,
                DestinationPreviewCard, StatusBadge, TripTabs, DayList,
                ActivityTimelineItem, AddActivityForm, AccommodationCard,
                AISuggestionPanel, TripNotesCard, RouteStopList, RouteMapCanvas
    wishlist/   WishlistCard, CategoryFilter
    planner/    PreferenceChip, PlanDayPreview
    profile/    ProfileStat, ProfileSidebarNav, RecentTripRow, CircleMember

  pages/
    auth/       Register, Login, VerifyOtp, ForgotPassword, ResetPassword, VerifyEmail
    onboarding/ PersonaSelect
    home/       Home
    trips/      CreateTrip, MyTrips, TripDetail (itinerary + map + budget + docs tabs), AIPlanner
    wishlist/   Wishlist
    profile/    Profile
    misc/       ComingSoon (placeholder for Flights/Hotels/Activities/Transport —
                those belong to Booking Service, a later backlog epic)
```

Every function in `src/api/*.js` has a one-line comment above it saying
which HTTP call it makes and which screen/button uses it — that's the
fastest way to find where to plug in a real endpoint.

## Known gaps (by design, not oversight)

- **Flights / Hotels / Activities / Transport** — real search/booking UI
  isn't built (that's Booking Service, a separate backlog epic outside
  the 10 architecture screens). Each has a polished, full-screen "Hold
  tight" page instead of a dead link — see the next section.
- **Map view** draws a stylised SVG route, not a real map tile provider
  — swap `src/components/trip/RouteMapCanvas.jsx` for Google Maps /
  Mapbox once you have an API key; it already receives the same `stops`
  data a real map would need.
- **Reviews & Payments** epics from the backlog aren't in the 10-screen
  architecture doc either, so they're not built here.

## Coming Soon screens (Flights / Hotels / Activities / Transport)

`/flights`, `/hotels`, `/activities`, `/transport` each render
`src/pages/misc/ComingSoon.jsx` with per-section copy from
`src/theme/comingSoonContent.js` — edit that file to change headline,
checklist, or icon per section.

**To add your background videos:** drop an MP4 into `public/videos/`
named exactly `coming-soon-flights.mp4`, `coming-soon-hotels.mp4`,
`coming-soon-activities.mp4`, `coming-soon-transport.mp4` (see
`public/videos/README.md`). Each page looks for its own file and plays
it full-bleed, muted and looping, automatically — no code changes
needed. If a file is missing or fails to load, an animated brand-color
gradient plays instead, so the screen never looks broken while you're
sourcing footage.

When a section is ready for real UI: delete its `<Route>` override near
the bottom of `App.jsx` and point that path at your real page — nothing
else references `ComingSoon`.
