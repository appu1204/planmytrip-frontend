# PlanMyTrip — Intelligent Travel Planning Platform (Frontend)

Modern, high-performance travel planning web application built with **React**, **Vite**, **Tailwind CSS**, and **Leaflet**. Designed for enterprise-grade performance, intuitive itinerary curation, real-time route mapping, and seamless persona-driven travel styling.

---

## 🚀 Key Features & Capabilities

- **Interactive Route Map (`RouteMapCanvas`):** Sequential GPS stop plotting with Leaflet, interactive polyline routes, day filters, and dynamic map layers (Google Roadmap, Google Satellite, Google Terrain, OpenStreetMap).
- **Custom Itinerary Planner (`/planner`):** Cinematic rotating hero banner with photographic backgrounds, smart travel parameters (vibe, dates, budget breakdown, interests), and day-by-day collapsible schedules with morning/afternoon/evening pacing.
- **Meteorological & Hazard Advisory:** Integrated weather and air quality monitoring with safety clearance verdicts.
- **Multi-Persona Dynamic System:** Real-time UI and thematic adaptation for *Family Vacations*, *Couple & Romance*, *Solo Exploration*, *Friends & Groups*, and *Adventure & Treks*.
- **Comprehensive Destination Catalog:** Curated multi-day route itineraries for *Kyoto*, *Goa*, *Kashmir*, *Kerala*, *Rajasthan*, *Dubai*, *Paris*, *Bali*, *Swiss Alps*, and dynamic thematic generation for custom global destinations.
- **Full Offline Resiliency:** Zero-crash architecture with graceful fallback data when backend microservices are offline.

---

## 🛠️ Tech Stack & Architecture

- **Core Framework:** React 19, React Router v7
- **Build Tool:** Vite v8
- **Styling:** Tailwind CSS + Vanilla CSS tokens
- **Map & Geolocation:** Leaflet + Leaflet-CSS
- **Icons & Typography:** Lucide React, Google Fonts (Newsreader display serif, Inter sans)
- **Quality Assurance:** Oxlint (0 warnings, 0 errors)

---

## 📦 Local Setup & Development

### 1. Prerequisites
- Node.js (v18+ recommended)
- npm (v9+)

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/appu1204/planmytrip-frontend.git
cd planmytrip-frontend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env
```

### 3. Run Development Server
```bash
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser.

### 4. Code Quality & Production Build
```bash
# Run ultra-fast linter
npm run lint

# Generate production bundle
npm run build
```

---

## ☁️ Deployment Guide (Render)

This repository is pre-configured for automated continuous deployment on **Render** as a Static Site.

### Method A: Blueprint 1-Click Deploy (`render.yaml`)
1. In your Render Dashboard, click **New +** → **Blueprint**.
2. Connect `https://github.com/appu1204/planmytrip-frontend`.
3. Select the branch: **`main`**.
4. Render will automatically apply settings from [`render.yaml`](./render.yaml).

### Method B: Manual Static Site Deploy
1. Click **New +** → **Static Site**.
2. Connect your repository: `appu1204/planmytrip-frontend`.
3. Set configuration parameters:
   - **Branch:** `main`
   - **Build Command:** `npm run build`
   - **Publish Directory:** `dist`
4. Client-side SPA routing is handled automatically by [`public/_redirects`](./public/_redirects).

---

## 🔌 Backend Microservices Integration

The frontend communicates with backend microservices via the shared Axios client in `src/api/client.js`.

For the complete API contract, REST routes, JSON payloads, and backend readiness checklist, refer to:
👉 **[BACKEND_REQUIREMENTS.md](./BACKEND_REQUIREMENTS.md)**

| Microservice | Gateway Route | Purpose |
|---|---|---|
| **User & Auth Service** | `/api/user/**` | Authentication, JWT issuing, user profile & persona |
| **Trip Management Service** | `/api/trip/**` | Trip CRUD, status tracking, budget breakdown |
| **AI Itinerary Service** | `/api/trip/trips/:id/itinerary/**` | Itinerary generation, activity timelines & route stops |
| **Wishlist Service** | `/api/trip/wishlist/**` | Saved destinations & collections |
| **Notification Service** | `/api/notification/**` | Flight alerts, newsletter subscriptions |

---

## 📂 Project Structure

```
planmytrip-frontend/
├── public/
│   ├── _redirects             # Render SPA client-side routing redirect
│   └── images/                # Background photography and assets
├── src/
│   ├── api/                   # Microservice REST API clients & interceptors
│   ├── components/
│   │   ├── home/              # Hero, search bar, destination collections
│   │   ├── layout/            # Navbar, Footer (Midnight Slate), ProtectedRoute
│   │   ├── planner/           # Preference chips, daily timeline previews
│   │   └── trip/              # Leaflet RouteMapCanvas, Weather advisory widget
│   ├── context/               # AuthContext (token & user synchronization)
│   ├── pages/
│   │   ├── home/              # Main landing page
│   │   ├── trips/             # AIPlanner, CreateTrip, MyTrips, TripDetail
│   │   ├── wishlist/          # Saved destinations wishlist
│   │   ├── profile/           # User profile & persona settings
│   │   └── misc/              # ComingSoon portals (Flights, Stays, Activities)
│   ├── theme/                 # Personas and styling tokens
│   └── utils/                 # Geocoding dictionary & fallback itinerary generator
├── render.yaml                # Render deployment blueprint
├── BACKEND_REQUIREMENTS.md    # Master backend REST specification
└── package.json
```

---

## 📄 License
© 2026 PlanMyTrip Inc. All rights reserved.
