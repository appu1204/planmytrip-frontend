import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  Sparkles,
  ShieldCheck,
  Layers,
  Headset,
  ArrowRight,
  CloudSun,
  MapPin,
  Compass,
  Star,
  Quote,
} from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import AuthDialog from "../../components/layout/AuthDialog";
import SearchBar from "../../components/home/SearchBar";
import QuickActions from "../../components/home/QuickActions";
import DestinationCard from "../../components/home/DestinationCard";
import TrustBadge from "../../components/home/TrustBadge";
import { useAuth } from "../../context/AuthContext";
import { getPersona, PERSONA_LIST } from "../../theme/personas";
import { FALLBACK_DESTINATIONS } from "../../theme/destinationFallback";
import { getPopularDestinations } from "../../api/destinations";

const heroImagePath = (personaKey) => `/images/hero-${personaKey}.jpg`;

const TRUST_ITEMS = [
  { icon: ShieldCheck, title: "Weather Clearance", subtitle: "Real-time hazard alerts & safety checks" },
  { icon: Sparkles, title: "AI-Powered", subtitle: "Custom day-by-day plans in seconds" },
  { icon: Layers, title: "Transparent Pricing", subtitle: "No hidden booking fees, ever" },
  { icon: Headset, title: "24/7 Global Assist", subtitle: "We're here for you anywhere" },
];

const CURATED_COLLECTIONS = [
  {
    title: "Monsoon Retreats & Rainforest Stays",
    subtitle: "Misty hills, tea plantations & tranquil backwaters",
    destination: "Kerala, India",
    image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80",
    tag: "Nature & Serenity",
    days: "5 Days",
  },
  {
    title: "High Mountain Passes & Alpine Lakes",
    subtitle: "Dramatic snow ridges, monasteries & stargazing",
    destination: "Leh Ladakh, India",
    image: "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=800&q=80",
    tag: "Adventure",
    days: "7 Days",
  },
  {
    title: "Romantic Cliffside Sunsets & Private Villas",
    subtitle: "Caldera views, turquoise pools & private dining",
    destination: "Santorini, Greece",
    image: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=800&q=80",
    tag: "Couples",
    days: "6 Days",
  },
  {
    title: "Zen Gardens & Ancient Heritage Shrines",
    subtitle: "Bamboo groves, tea houses & peaceful temples",
    destination: "Kyoto, Japan",
    image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80",
    tag: "Solo & Culture",
    days: "8 Days",
  },
];

const TESTIMONIALS = [
  {
    name: "Arjun & Priya M.",
    location: "Mumbai",
    persona: "Couple",
    rating: 5,
    quote:
      "PlanMyTrip designed our entire 8-day honeymoon across Greece. The live weather clearance let us adjust our ferry trips ahead of time without any stress!",
    avatar: "AP",
  },
  {
    name: "Liam O'Connor",
    location: "London",
    persona: "Solo Traveler",
    rating: 5,
    quote:
      "As a solo traveler, the tailored pacing and safety recommendations gave me the confidence to explore hidden spots in Japan I wouldn't have found elsewhere.",
    avatar: "LO",
  },
  {
    name: "Sneha & The Squad",
    location: "Bengaluru",
    persona: "Friends",
    rating: 5,
    quote:
      "We usually spend 2 weeks arguing in WhatsApp groups about what to do in Goa. PlanMyTrip's AI generated a plan we all loved in under 60 seconds.",
    avatar: "SS",
  },
];

export default function Home() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedAuth = searchParams.get("auth");
  const [authMode, setAuthMode] = useState(() =>
    requestedAuth === "register" ? "register" : requestedAuth === "login" ? "login" : null
  );

  const [activePersonaKey, setActivePersonaKey] = useState(
    user?.persona || (isAuthenticated ? "family" : "solo")
  );

  const persona = getPersona(activePersonaKey);
  const [destinations, setDestinations] = useState(FALLBACK_DESTINATIONS[persona.key] || []);
  const [heroFailed, setHeroFailed] = useState(false);

  useEffect(() => {
    document.documentElement.dataset.persona = persona.key;
  }, [persona.key]);

  useEffect(() => {
    let cancelled = false;
    getPopularDestinations(persona.key, 6)
      .then((data) => {
        if (!cancelled && Array.isArray(data) && data.length) setDestinations(data);
        else if (!cancelled) setDestinations(FALLBACK_DESTINATIONS[persona.key] || []);
      })
      .catch(() => {
        if (!cancelled) setDestinations(FALLBACK_DESTINATIONS[persona.key] || []);
      });
    return () => {
      cancelled = true;
    };
  }, [persona.key]);

  const firstName = user?.fullName?.split(" ")[0] || "Traveler";

  const openAuth = (mode = "login") => {
    setAuthMode(mode);
    setSearchParams({ auth: mode });
  };

  const closeAuth = useCallback(() => {
    setAuthMode(null);
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current);
        next.delete("auth");
        return next;
      },
      { replace: true }
    );
  }, [setSearchParams]);

  const switchAuthMode = useCallback(
    (mode) => {
      setAuthMode(mode);
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current);
          next.set("auth", mode);
          return next;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  return (
    <div className="min-h-screen bg-[#f6f5f1] text-slate-900 selection:bg-amber-100 selection:text-emerald-950">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-slate-950">
        <Navbar user={user} transparent isAuthenticated={isAuthenticated} onOpenAuth={openAuth} />

        <div className="relative min-h-[560px] sm:min-h-[640px] lg:min-h-[680px]">
          {!heroFailed ? (
            <img
              src={heroImagePath(persona.key)}
              alt="Destination preview"
              onError={() => setHeroFailed(true)}
              className="absolute inset-0 h-full w-full object-cover transition-opacity duration-700"
            />
          ) : (
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `linear-gradient(135deg, var(--brand-dark), var(--brand-mid))`,
              }}
            />
          )}

          {/* Cinematic Vignette Overlay */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(90deg, rgba(6,15,11,0.88) 0%, rgba(6,15,11,0.55) 50%, rgba(6,15,11,0.2) 100%)",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-black/30" />

          {/* Hero Content */}
          <div className="relative mx-auto flex max-w-7xl min-h-[560px] flex-col justify-center gap-6 px-5 pb-16 pt-28 sm:min-h-[640px] sm:px-10 sm:pb-20 sm:pt-32 lg:px-12">
            <div className="max-w-2xl">
              {/* Persona Pill Selector right in Hero */}
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-white backdrop-blur-md">
                  <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                  {persona.home.badge}
                </span>

                <div className="hidden sm:flex items-center gap-1 rounded-full bg-black/35 p-1 backdrop-blur-md">
                  {PERSONA_LIST.map((p) => (
                    <button
                      key={p.key}
                      onClick={() => setActivePersonaKey(p.key)}
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold transition ${
                        p.key === persona.key
                          ? "bg-white text-slate-950 shadow-sm"
                          : "text-white/80 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <h1 className="font-display text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl">
                {persona.home.headlinePrefix}{" "}
                <span className="italic" style={{ color: "var(--accent)" }}>
                  {persona.home.headlineAccent}
                </span>
              </h1>

              <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/90 sm:text-base md:text-lg">
                {persona.home.subcopy}{" "}
                {isAuthenticated
                  ? `Curated day-by-day journeys for ${firstName}'s circle.`
                  : "AI-engineered itineraries, verified stays, and real-time hazard clearance."}
              </p>
            </div>

            <SearchBar />
            <QuickActions />
          </div>
        </div>
      </div>

      {/* Popular destinations — Overlaps hero with luxury styling */}
      <section className="relative z-10 mx-4 -mt-10 rounded-3xl bg-white p-6 shadow-panel sm:mx-8 sm:p-8 lg:mx-auto lg:max-w-7xl">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700">
              <Compass className="h-4 w-4" /> Top Destinations
            </div>
            <h2 className="mt-1 font-display text-2xl font-bold text-slate-900 sm:text-3xl">
              Popular Destinations{" "}
              <span className="text-emerald-700">
                {isAuthenticated ? persona.home.sectionLabel : `for ${persona.label} Travelers`}
              </span>
            </h2>
            <p className="mt-1 text-xs text-slate-500 sm:text-sm">
              Click any destination to build an instant customized itinerary.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/planner"
              className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:opacity-90"
              style={{ backgroundColor: "var(--brand)" }}
            >
              <Sparkles className="h-3.5 w-3.5" /> Plan Custom Trip →
            </Link>
          </div>
        </div>

        {/* Horizontal scroll container with custom scrollbar */}
        <div className="flex gap-5 overflow-x-auto pb-4 pt-1">
          {destinations.map((d, i) => (
            <DestinationCard
              key={d.id || d.name}
              destination={d}
              index={i}
              onOpenAuth={openAuth}
            />
          ))}
        </div>
      </section>

      {/* Trust Strip */}
      <div className="mx-4 mt-12 sm:mx-8 lg:mx-auto lg:max-w-7xl">
        <div className="grid grid-cols-1 gap-4 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-card sm:grid-cols-2 lg:grid-cols-4 sm:p-8">
          {TRUST_ITEMS.map((item) => (
            <TrustBadge key={item.title} {...item} />
          ))}
        </div>
      </div>

      {/* How It Works: 3 Steps */}
      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="text-center">
          <span
            className="rounded-full px-3.5 py-1 text-xs font-bold uppercase tracking-widest"
            style={{ backgroundColor: "var(--brand-light)", color: "var(--brand)" }}
          >
            Simple & Effortless
          </span>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            How PlanMyTrip Crafts Your Perfect Journey
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
            No more browser tabs chaos or guesswork. Experience travel planning engineered for real
            peace of mind.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="relative rounded-3xl border border-slate-200/80 bg-white p-8 shadow-card transition-all hover:-translate-y-1 hover:shadow-card-hover">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-50 text-emerald-700 font-display text-xl font-bold">
              1
            </div>
            <h3 className="mt-5 font-display text-xl font-bold text-slate-900">
              Set Your Vibe & Dates
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Choose your travel persona (Solo, Couple, Family, Friends, or Adventure), budget, and
              dates. Our AI tailors activities matched to your circle's rhythm.
            </p>
          </div>

          <div className="relative rounded-3xl border border-slate-200/80 bg-white p-8 shadow-card transition-all hover:-translate-y-1 hover:shadow-card-hover">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-amber-50 text-amber-700 font-display text-xl font-bold">
              2
            </div>
            <h3 className="mt-5 font-display text-xl font-bold text-slate-900">
              Live Weather Clearance
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Before you leave, our meteorological engine scans rainfall, storms, and air quality to
              generate instant travel advisories so you never get stranded.
            </p>
          </div>

          <div className="relative rounded-3xl border border-slate-200/80 bg-white p-8 shadow-card transition-all hover:-translate-y-1 hover:shadow-card-hover">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-50 text-blue-700 font-display text-xl font-bold">
              3
            </div>
            <h3 className="mt-5 font-display text-xl font-bold text-slate-900">
              Real-Time Route Map & Stays
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Get an interactive map with optimized stop sequences, verified accommodations, budget
              breakdowns, and downloadable day schedules.
            </p>
          </div>
        </div>
      </section>

      {/* Curated Seasonal Collections */}
      <section className="bg-slate-100/60 py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-800">
                Handpicked Collections
              </span>
              <h2 className="mt-1 font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Curated Travel Blueprints
              </h2>
              <p className="mt-2 text-sm text-slate-600 sm:text-base">
                Tested itineraries designed by destination experts and verified travelers.
              </p>
            </div>
            <Link
              to="/planner"
              className="text-sm font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              Explore all themes <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {CURATED_COLLECTIONS.map((c) => (
              <div
                key={c.title}
                onClick={() =>
                  navigate("/trips/new", { state: { destination: c.destination } })
                }
                className="group cursor-pointer overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-card transition-all duration-300 hover:-translate-y-1.5 hover:shadow-card-hover"
              >
                <div className="relative h-48 w-full overflow-hidden">
                  <img
                    src={c.image}
                    alt={c.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
                    <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-bold backdrop-blur-md">
                      {c.tag}
                    </span>
                    <span className="text-xs font-medium text-white/90">{c.days}</span>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-1 text-xs font-semibold text-emerald-700">
                    <MapPin className="h-3 w-3" /> {c.destination}
                  </div>
                  <h3 className="mt-1.5 font-display text-base font-bold text-slate-900 leading-snug group-hover:text-emerald-800">
                    {c.title}
                  </h3>
                  <p className="mt-1.5 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {c.subtitle}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Spotlight: Real-time Weather & Hazard Clearance */}
      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-[#0c2e22] via-[#092219] to-[#05150f] p-8 text-white shadow-panel sm:p-14">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-amber-300 backdrop-blur-md">
                <CloudSun className="h-4 w-4" /> Live Meteorological Intelligence
              </span>
              <h2 className="mt-4 font-display text-3xl font-bold leading-tight sm:text-4xl">
                Never Let Extreme Weather Ruin Your Vacation
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-slate-300 sm:text-base">
                PlanMyTrip integrates live environmental telemetry for any destination worldwide.
                From flash flood risks in tropical islands to mountain snow conditions and air
                quality indices, get instant proactive clearances.
              </p>
              <div className="mt-6 space-y-3 text-sm text-slate-200">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  <span>Automated safety windows for upcoming 0-4 day departures</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  <span>Real-time precipitation, wind gust & AQI radar tracking</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  <span>Smart alternative indoor itinerary recommendations on rain days</span>
                </div>
              </div>

              <button
                onClick={() => navigate("/trips/new")}
                className="mt-8 flex items-center gap-2 rounded-xl bg-amber-400 px-6 py-3.5 text-sm font-bold text-slate-950 transition hover:bg-amber-300 active:scale-95"
              >
                <span>Check Destination Clearance</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            <div className="relative rounded-2xl border border-white/15 bg-white/5 p-6 backdrop-blur-md">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <div className="text-xs text-slate-400">Live Telemetry Report</div>
                  <div className="font-display text-lg font-bold text-white">
                    {persona.key === "adventure"
                      ? "Leh Ladakh, India"
                      : persona.key === "couple"
                      ? "Santorini, Greece"
                      : "Kerala, India"}
                  </div>
                </div>
                <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-300 border border-emerald-500/30">
                  SAFE TO TRAVEL
                </span>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                <div className="rounded-xl bg-white/5 p-3">
                  <div className="text-[11px] text-slate-400">Temperature</div>
                  <div className="mt-1 font-display text-xl font-bold text-white">26°C</div>
                </div>
                <div className="rounded-xl bg-white/5 p-3">
                  <div className="text-[11px] text-slate-400">Precipitation</div>
                  <div className="mt-1 font-display text-xl font-bold text-emerald-300">12%</div>
                </div>
                <div className="rounded-xl bg-white/5 p-3">
                  <div className="text-[11px] text-slate-400">Air Quality</div>
                  <div className="mt-1 font-display text-xl font-bold text-white">AQI 32</div>
                </div>
              </div>

              <div className="mt-5 rounded-xl bg-emerald-950/50 p-4 border border-emerald-500/20 text-xs leading-relaxed text-emerald-200">
                <strong>Safety Clearance Verdict:</strong> Mild seasonal conditions with clear
                skies. Perfect weather window for outdoor sightseeing, coastal tours, and hiking.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Traveler Testimonials */}
      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="text-center">
          <span
            className="rounded-full px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-emerald-800"
            style={{ backgroundColor: "var(--brand-light)" }}
          >
            Loved by Travelers
          </span>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Real Stories From The Travel Circle
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-600 sm:text-base">
            See how solo backpackers, couples, and families plan their dream escapes with PlanMyTrip.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              className="flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-7 shadow-card transition-all hover:-translate-y-1 hover:shadow-card-hover"
            >
              <div>
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(t.rating)].map((_, idx) => (
                    <Star key={idx} className="h-4 w-4 fill-amber-400" />
                  ))}
                </div>
                <Quote className="mt-4 h-6 w-6 text-slate-300" />
                <p className="mt-2 text-sm leading-relaxed text-slate-700 font-medium">
                  "{t.quote}"
                </p>
              </div>

              <div className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-4">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-emerald-100 font-bold text-emerald-900 text-xs">
                  {t.avatar}
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">{t.name}</div>
                  <div className="text-xs text-slate-500">
                    {t.location} · <span className="text-emerald-700">{t.persona}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="mx-auto max-w-7xl px-6 pb-16 lg:px-8">
        <div
          className="flex flex-col items-center justify-between gap-6 rounded-3xl p-10 text-center text-white sm:flex-row sm:text-left sm:p-14 shadow-panel"
          style={{ backgroundImage: "linear-gradient(135deg, var(--brand-dark), var(--brand))" }}
        >
          <div className="max-w-xl">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
              Start Your Next Escape
            </span>
            <h2 className="mt-2 font-display text-3xl font-bold leading-tight sm:text-4xl">
              Ready to create your dream itinerary?
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-white/85 sm:text-base">
              Generate a personalized, day-by-day travel plan with real-time weather clearance in
              seconds.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate("/planner")}
              className="flex items-center gap-2 rounded-xl bg-amber-400 px-7 py-4 text-sm font-bold text-slate-950 transition hover:bg-amber-300 shadow-md active:scale-95"
            >
              <Sparkles className="h-4 w-4" /> Start Planning with AI
            </button>
          </div>
        </div>
      </section>

      {/* Global Footer */}
      <Footer />

      {/* Auth Dialog Modal */}
      {authMode && !isAuthenticated && (
        <AuthDialog mode={authMode} onClose={closeAuth} onModeChange={switchAuthMode} />
      )}
    </div>
  );
}

