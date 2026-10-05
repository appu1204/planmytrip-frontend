import { useState, useMemo, useEffect } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
  MapPin,
  Calendar,
  Clock,
  Check,
  RefreshCw,
  Share2,
  Printer,
  Compass,
  Map as MapIcon,
  ListOrdered,
  Layers,
  Users,
  Luggage,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Info,
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
} from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import Counter from "../../components/trip/Counter";
import PreferenceChip from "../../components/planner/PreferenceChip";
import PlanDayPreview from "../../components/planner/PlanDayPreview";
import RouteMapCanvas from "../../components/trip/RouteMapCanvas";
import WeatherAdvisoryModal from "../../components/trip/WeatherAdvisoryModal";
import { fetchDestinationWeather, evaluateWeatherSafety } from "../../utils/weatherAdvisor";
import { useAuth } from "../../context/AuthContext";
import { getPersona } from "../../theme/personas";
import { generateStandaloneItinerary, saveItinerary } from "../../api/itinerary";
import { createTrip } from "../../api/trips";
import {
  buildFallbackItinerary,
  itineraryToRouteStops,
  getDestinationCenter,
  fetchDestinationCoordinatesAsync,
} from "../../utils/itineraryFallback";

function getDefaultDates() {
  const start = new Date();
  start.setDate(start.getDate() + 7);
  const end = new Date(start);
  end.setDate(end.getDate() + 5);
  return {
    checkIn: start.toISOString().split("T")[0],
    checkOut: end.toISOString().split("T")[0],
  };
}

// Background scrolling & rotating hero banner slides
const HERO_SLIDES = [
  {
    image: "/images/airliner-clouds.png",
    tag: "Flight & Global Itineraries",
    title: "Plan Your Journey Day by Day",
    subtitle: "Custom travel schedules, interactive route maps, and verified local recommendations.",
  },
  {
    image: "/images/sunset-pool.png",
    tag: "Resorts, Villas & Stays",
    title: "Handpicked Stays & Scenic Sights",
    subtitle: "From coastal getaways to cultural corridors with balanced daily travel pacing.",
  },
  {
    image: "/images/highway-bus.png",
    tag: "Road Trips & Transfers",
    title: "Explore Destinations Seamlessly",
    subtitle: "Turn-by-turn route maps with optimized stops so you spend more time enjoying.",
  },
];

const QUICK_DESTINATIONS = [
  "Goa, India",
  "Kerala, India",
  "Kashmir, India",
  "Kyoto, Japan",
  "Jaipur, Rajasthan",
  "Dubai, UAE",
  "Paris, France",
  "Bali, Indonesia",
  "Swiss Alps",
];

const TRAVEL_STYLES = [
  { key: "family", label: "Family", icon: "👨‍👩‍👧" },
  { key: "romantic", label: "Couples", icon: "❤️" },
  { key: "solo", label: "Solo", icon: "🎒" },
  { key: "friends", label: "Friends", icon: "👥" },
  { key: "adventure", label: "Adventure", icon: "🏔️" },
];

const PREFERENCE_OPTIONS = [
  { id: "Beaches", label: "Beaches", icon: "🏖️" },
  { id: "Backwaters", label: "Backwaters", icon: "🌿" },
  { id: "Trekking", label: "Mountains", icon: "🏔️" },
  { id: "Dining", label: "Dining", icon: "🍜" },
  { id: "Museums", label: "Heritage", icon: "🏛️" },
  { id: "Wildlife", label: "Wildlife", icon: "🐅" },
  { id: "Nightlife", label: "Nightlife", icon: "🍸" },
  { id: "Wellness", label: "Wellness", icon: "🧘" },
  { id: "Photography", label: "Viewpoints", icon: "📸" },
  { id: "Shopping", label: "Shopping", icon: "🛍️" },
];

const BUDGET_TIERS = [
  { label: "Budget", value: 35000 },
  { label: "Comfort", value: 110000 },
  { label: "Luxury", value: 240000 },
];

export default function AIPlanner() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { state } = useLocation();
  const [searchParams] = useSearchParams();
  const defaultDates = useMemo(() => getDefaultDates(), []);

  const queryDest = searchParams.get("destination") || searchParams.get("dest") || "";
  const [selectedStyle, setSelectedStyle] = useState(
    state?.searchMode === "stays" ? "family" : user?.persona || "family"
  );
  const persona = getPersona(selectedStyle);

  const [form, setForm] = useState({
    destination: state?.destination || queryDest || "Goa, India",
    checkIn: state?.checkIn || defaultDates.checkIn,
    checkOut: state?.checkOut || defaultDates.checkOut,
    budget: state?.budget || 65000,
    adults: state?.adults || 2,
    children: state?.children || 0,
  });

  const [preferences, setPreferences] = useState(["Beaches", "Photography"]);
  const [plan, setPlan] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeDayNumber, setActiveDayNumber] = useState(1);

  // Real-time Weather & Safety Advisory State
  const [weatherAdvisory, setWeatherAdvisory] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [showWeatherModal, setShowWeatherModal] = useState(false);

  // View mode for results: "combined" (map + timeline), "timeline", "map"
  const [viewMode, setViewMode] = useState("combined");

  // Rotating background banner state
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6500);
    return () => clearInterval(timer);
  }, []);

  const set = (field) => (value) => setForm((f) => ({ ...f, [field]: value }));

  // Automatically calculate trip duration
  const tripDuration = useMemo(() => {
    if (!form.checkIn || !form.checkOut) return { nights: 4, days: 5 };
    const start = new Date(form.checkIn);
    const end = new Date(form.checkOut);
    const diff = Math.round((end - start) / (1000 * 60 * 60 * 24));
    const nights = diff > 0 ? diff : 1;
    return { nights, days: nights + 1 };
  }, [form.checkIn, form.checkOut]);

  const travellersLabel = `${form.adults + form.children} Travelers (${form.adults} Adults${
    form.children > 0 ? `, ${form.children} Children` : ""
  })`;

  const totalActivitiesCount = useMemo(() => {
    if (!plan || !plan.days) return 0;
    return plan.days.reduce((acc, d) => acc + (d.activities?.length || 0), 0);
  }, [plan]);

  const [resolvedCoords, setResolvedCoords] = useState(null);

  useEffect(() => {
    let isMounted = true;
    if (form.destination) {
      fetchDestinationCoordinatesAsync(form.destination).then((coords) => {
        if (isMounted && coords) {
          setResolvedCoords(coords);
        }
      });
    }
    return () => {
      isMounted = false;
    };
  }, [form.destination]);

  // Geographical center coordinate for the destination
  const destinationCenter = useMemo(() => {
    return resolvedCoords || getDestinationCenter(form.destination || "new delhi");
  }, [form.destination, resolvedCoords]);

  // Route stops for the interactive Leaflet Map
  const routeStops = useMemo(() => {
    if (!plan) return [];
    return itineraryToRouteStops(plan, form.destination, destinationCenter);
  }, [plan, form.destination, destinationCenter]);

  const dayTag = (index, total) => {
    if (index === 1) return "Arrival & Orientation";
    if (index === total) return "Wind Down & Souvenirs";
    if (index === 2) return "Signature Sights";
    return preferences[0] ? `${preferences[0]}` : "Highlights";
  };

  const validateForm = (targetForm = form) => {
    if (!targetForm.destination.trim()) {
      setError("Please enter or select a travel destination.");
      return false;
    }
    if (!targetForm.checkIn || !targetForm.checkOut) {
      setError("Please select both check-in and check-out dates.");
      return false;
    }
    if (new Date(targetForm.checkOut) <= new Date(targetForm.checkIn)) {
      setError("Check-out date must be after check-in date.");
      return false;
    }
    return true;
  };

  // Dynamic Generator: Runs standalone backend AI endpoint or rich responsive fallback
  const generateWith = async (
    targetForm = form,
    targetStyle = selectedStyle,
    targetPrefs = preferences
  ) => {
    setError("");
    if (!validateForm(targetForm)) return;
    setGenerating(true);
    const payload = {
      destination: targetForm.destination,
      checkIn: targetForm.checkIn,
      checkOut: targetForm.checkOut,
      budget: targetForm.budget,
      adults: targetForm.adults,
      children: targetForm.children,
      preferences: targetPrefs,
      persona: targetStyle,
    };
    try {
      const result = await generateStandaloneItinerary(payload);
      if (result && result.days && result.days.length > 0) {
        setPlan(result);
      } else {
        setPlan(buildFallbackItinerary(payload));
      }
    } catch {
      setPlan(buildFallbackItinerary(payload));
    } finally {
      setGenerating(false);
      setActiveDayNumber(1);
    }
  };

  const generate = () => generateWith(form, selectedStyle, preferences);

  // Pre-load initial itinerary on first visit
  useEffect(() => {
    if (!plan && form.destination) {
      generateWith(form, selectedStyle, preferences);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Live Weather & Safety Advisory for Selected Destination
  useEffect(() => {
    let isMounted = true;
    async function loadWeather() {
      if (!form.destination) return;
      setWeatherLoading(true);
      try {
        const raw = await fetchDestinationWeather(form.destination);
        const advisory = evaluateWeatherSafety(raw, {
          startDate: form.checkIn,
          endDate: form.checkOut,
        });
        if (isMounted) {
          setWeatherAdvisory(advisory);
        }
      } catch (err) {
        console.warn("Weather advisory fetch error:", err);
      } finally {
        if (isMounted) setWeatherLoading(false);
      }
    }
    loadWeather();
    return () => {
      isMounted = false;
    };
  }, [form.destination, form.checkIn, form.checkOut]);

  // Quick Action Handlers for Instant Interactivity
  const handleSelectQuickDest = (q) => {
    const nextForm = { ...form, destination: q };
    setForm(nextForm);
    generateWith(nextForm, selectedStyle, preferences);
  };

  const handleSelectStyle = (key) => {
    setSelectedStyle(key);
    generateWith(form, key, preferences);
  };

  const handleTogglePreference = (id) => {
    const isDining = id === "Dining" || id === "Local food";
    let next;
    if (isDining) {
      const hasDining = preferences.includes("Dining") || preferences.includes("Local food");
      if (hasDining) {
        next = preferences.filter((p) => p !== "Dining" && p !== "Local food");
      } else {
        next = [...preferences, "Dining"];
      }
    } else {
      next = preferences.includes(id)
        ? preferences.filter((p) => p !== id)
        : [...preferences, id];
    }
    setPreferences(next);
    generateWith(form, selectedStyle, next);
  };

  const handleBudgetChange = (budgetVal) => {
    const nextForm = { ...form, budget: budgetVal };
    setForm(nextForm);
    generateWith(nextForm, selectedStyle, preferences);
  };

  const handleDateChange = (field, val) => {
    const nextForm = { ...form, [field]: val };
    setForm(nextForm);
    if (nextForm.checkIn && nextForm.checkOut && new Date(nextForm.checkOut) > new Date(nextForm.checkIn)) {
      generateWith(nextForm, selectedStyle, preferences);
    }
  };

  const handleTravelerChange = (field, val) => {
    const nextForm = { ...form, [field]: val };
    setForm(nextForm);
    generateWith(nextForm, selectedStyle, preferences);
  };

  const saveToTrip = async () => {
    if (!plan) return;
    if (!isAuthenticated) {
      navigate("/home?auth=login", {
        state: { returnTo: "/planner", pendingPlan: plan },
      });
      return;
    }
    setSaving(true);
    setError("");
    try {
      const trip = await createTrip({
        userId: user?.id,
        name: `${form.destination || "New"} Trip`,
        destination: form.destination,
        tripType: selectedStyle,
        checkIn: form.checkIn,
        checkOut: form.checkOut,
        adults: form.adults,
        children: form.children,
        budget: form.budget,
        currency: "INR",
        status: "PLANNED",
      });
      const tripId = trip?.id ?? trip?.tripId ?? trip?.data?.id ?? trip?.data?.tripId;
      if (tripId) {
        try {
          await saveItinerary(tripId, plan);
        } catch {
          // offline resilient
        }
      }
      navigate(tripId ? `/trips/${tripId}` : "/trips");
    } catch (err) {
      setError(err.message || "Failed to create trip. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-slate-900">
      <Navbar user={user} />

      {/* Hero Header with Scrolling / Rotating Background Banner */}
      <section className="relative overflow-hidden bg-slate-950 text-white min-h-[380px] sm:min-h-[440px] lg:min-h-[460px] flex items-center border-b border-slate-800">
        {/* Background Rotating Images with Full Visual Clarity */}
        <div className="absolute inset-0 z-0">
          {HERO_SLIDES.map((slide, idx) => (
            <div
              key={slide.image}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                idx === currentSlide ? "opacity-100 scale-100" : "opacity-0 scale-105 pointer-events-none"
              }`}
              style={{
                transitionProperty: "opacity, transform",
                transitionDuration: "1200ms",
              }}
            >
              <img
                src={slide.image}
                alt={slide.title}
                className="h-full w-full object-cover object-center"
              />
            </div>
          ))}
          {/* Light, natural scrim that preserves the image's colors, sky, and clarity */}
          <div className="absolute inset-0 bg-black/25" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20" />
        </div>

        {/* Content Container */}
        <div className="relative z-10 mx-auto max-w-7xl w-full px-6 py-10 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            {/* Frosted Glass Card for Crisp, Readable Typography without Blacking out the Image */}
            <div className="max-w-xl rounded-3xl bg-slate-950/70 p-6 sm:p-8 backdrop-blur-md border border-white/15 shadow-2xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-amber-300 border border-white/15">
                <Compass className="h-3.5 w-3.5 text-amber-300" />
                <span>{HERO_SLIDES[currentSlide].tag}</span>
              </div>

              <h1 className="mt-3 font-display text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
                {HERO_SLIDES[currentSlide].title}
              </h1>

              <p className="mt-2.5 text-xs sm:text-sm text-slate-200 leading-relaxed">
                {HERO_SLIDES[currentSlide].subtitle}
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-2 text-xs">
                <div className="flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-1.5 text-slate-200 border border-white/10 backdrop-blur-sm">
                  <MapIcon className="h-3.5 w-3.5 text-emerald-400" /> Route Maps
                </div>
                <div className="flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-1.5 text-slate-200 border border-white/10 backdrop-blur-sm">
                  <Clock className="h-3.5 w-3.5 text-amber-400" /> Day Pacing
                </div>
                <div className="flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-1.5 text-slate-200 border border-white/10 backdrop-blur-sm">
                  <Luggage className="h-3.5 w-3.5 text-blue-400" /> Trip Studio
                </div>
              </div>
            </div>
          </div>

          {/* Banner Slider Floating Indicator Controls */}
          <div className="mt-8 flex items-center justify-between">
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-950/60 px-3.5 py-1.5 backdrop-blur-md border border-white/15">
              {HERO_SLIDES.map((slide, idx) => (
                <button
                  key={slide.tag}
                  type="button"
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    idx === currentSlide ? "w-8 bg-amber-400" : "w-2 bg-white/40 hover:bg-white/70"
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>

            <div className="inline-flex items-center gap-2 rounded-full bg-slate-950/60 px-3 py-1 backdrop-blur-md border border-white/15 text-xs text-slate-300">
              <button
                type="button"
                onClick={() => setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}
                className="p-1 rounded-lg hover:bg-white/15 text-white/80 hover:text-white transition"
                aria-label="Previous banner"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span>
                {currentSlide + 1} / {HERO_SLIDES.length}
              </span>
              <button
                type="button"
                onClick={() => setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length)}
                className="p-1 rounded-lg hover:bg-white/15 text-white/80 hover:text-white transition"
                aria-label="Next banner"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Two-Column Planning Cockpit */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {error && (
          <div className="mb-6 rounded-2xl bg-red-50 border border-red-200 p-4 text-xs font-semibold text-red-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={() => setError("")}
              className="text-red-500 hover:text-red-800"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[380px_1fr] items-start">
          {/* LEFT COLUMN: Trip Configuration Form (With Clean Independent Scrolling & Accessible Action Buttons) */}
          <div className="lg:sticky lg:top-24 lg:max-h-[calc(100vh-6.5rem)] lg:overflow-y-auto rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm scrollbar-thin">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
              <div>
                <h2 className="font-display text-lg font-bold text-slate-900">Trip Details</h2>
                <p className="text-xs text-slate-500 mt-0.5">Customize dates, budget, and travel preferences</p>
              </div>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                Planner
              </span>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                generate();
              }}
              className="space-y-5"
            >
              {/* 1. Destination Input */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Destination
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-3 h-4 w-4 text-emerald-600" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. New Delhi, Goa, Kerala, Kyoto, Paris"
                    value={form.destination}
                    onChange={(e) => {
                      const val = e.target.value;
                      set("destination")(val);
                    }}
                    onBlur={() => {
                      if (form.destination && form.destination.trim().length >= 3) {
                        generate();
                      }
                    }}
                    className="w-full rounded-xl border border-slate-300 pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600 shadow-sm"
                  />
                </div>

                {/* Popular Destinations Quick Select (Instant Interactive Generation) */}
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {QUICK_DESTINATIONS.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => handleSelectQuickDest(q)}
                      className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition cursor-pointer ${
                        form.destination === q
                          ? "bg-slate-900 text-white font-semibold shadow-sm"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                      }`}
                    >
                      {q.split(",")[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Travel Style (Instant Interactive Update) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Travel Style
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {TRAVEL_STYLES.map((st) => (
                    <button
                      key={st.key}
                      type="button"
                      onClick={() => handleSelectStyle(st.key)}
                      className={`flex flex-col items-center justify-center p-2 rounded-xl text-center border text-xs font-semibold transition-all cursor-pointer ${
                        selectedStyle === st.key
                          ? "border-emerald-600 bg-emerald-50 text-emerald-950 ring-1 ring-emerald-600 shadow-sm"
                          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <span className="text-base mb-0.5">{st.icon}</span>
                      <span className="text-[11px]">{st.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Dates with Nights Counter */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    Travel Dates
                  </label>
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-700">
                    {tripDuration.nights} Nights · {tripDuration.days} Days
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <span className="text-[10px] font-medium text-slate-500 mb-1 block">Start Date</span>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                      <input
                        type="date"
                        required
                        value={form.checkIn}
                        onChange={(e) => handleDateChange("checkIn", e.target.value)}
                        className="w-full rounded-xl border border-slate-300 pl-8 pr-2 py-2 text-xs font-semibold text-slate-800 focus:border-emerald-600 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] font-medium text-slate-500 mb-1 block">End Date</span>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                      <input
                        type="date"
                        required
                        value={form.checkOut}
                        onChange={(e) => handleDateChange("checkOut", e.target.value)}
                        className="w-full rounded-xl border border-slate-300 pl-8 pr-2 py-2 text-xs font-semibold text-slate-800 focus:border-emerald-600 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. Budget Slider with Tiers */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    Total Budget
                  </label>
                  <div className="text-right">
                    <span className="font-display text-sm font-bold text-slate-900">
                      ₹{form.budget.toLocaleString("en-IN")}
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      ~₹{Math.round(form.budget / (tripDuration.days || 1) / (form.adults + form.children || 1)).toLocaleString("en-IN")}/day/person
                    </span>
                  </div>
                </div>

                <input
                  type="range"
                  min={20000}
                  max={350000}
                  step={5000}
                  value={form.budget}
                  onChange={(e) => handleBudgetChange(Number(e.target.value))}
                  className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-emerald-600"
                />

                <div className="mt-2 grid grid-cols-3 gap-2">
                  {BUDGET_TIERS.map((tier) => (
                    <button
                      key={tier.label}
                      type="button"
                      onClick={() => handleBudgetChange(tier.value)}
                      className={`rounded-xl border py-1.5 text-center text-[11px] font-semibold transition cursor-pointer ${
                        Math.abs(form.budget - tier.value) < 15000
                          ? "border-emerald-600 bg-emerald-50 text-emerald-950 font-bold"
                          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {tier.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 5. Travelers Counters */}
              <div className="space-y-2">
                <Counter
                  label="Adults"
                  sublabel="Ages 18+"
                  value={form.adults}
                  onChange={(val) => handleTravelerChange("adults", val)}
                  min={1}
                />
                <Counter
                  label="Children"
                  sublabel="Ages 2-17"
                  value={form.children}
                  onChange={(val) => handleTravelerChange("children", val)}
                  min={0}
                />
                <div className="text-[11px] font-medium text-slate-500 flex items-center gap-1.5 pt-0.5">
                  <Users className="h-3.5 w-3.5 text-slate-400" /> {travellersLabel}
                </div>
              </div>

              {/* 6. Travel Interests & Experiences (Instant Responsive Filter) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Travel Interests & Sights
                </label>
                <div className="flex flex-wrap gap-2">
                  {PREFERENCE_OPTIONS.map((p) => (
                    <PreferenceChip
                      key={p.id}
                      id={p.id}
                      label={p.label}
                      icon={p.icon}
                      active={
                        preferences.includes(p.id) ||
                        (p.id === "Dining" && preferences.includes("Local food"))
                      }
                      onToggle={handleTogglePreference}
                    />
                  ))}
                </div>
              </div>

              {/* Main Submit Button (Always in view or reachable) */}
              <button
                type="submit"
                disabled={generating}
                className="w-full rounded-2xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold p-3.5 text-center shadow-md transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 text-sm cursor-pointer"
              >
                {generating ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Building Itinerary...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 text-emerald-200" />
                    <span>Generate Itinerary →</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* RIGHT COLUMN: Interactive Leaflet Map & Day-by-Day Canvas */}
          <div id="itinerary-canvas" className="min-w-0 space-y-6">
            {plan && (
              <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-7 shadow-sm">
                {/* Header Summary & View Mode Switcher */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-800 border border-emerald-200">
                        {persona.label}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        {tripDuration.days} Days / {tripDuration.nights} Nights
                      </span>
                      {generating && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-full animate-pulse">
                          <RefreshCw className="h-3 w-3 animate-spin" /> Updating Plan...
                        </span>
                      )}
                    </div>

                    <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900">
                      {plan.days?.length || tripDuration.days}-Day Itinerary for {form.destination}
                    </h2>

                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" /> {form.checkIn} to {form.checkOut}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-slate-400" /> {totalActivitiesCount} Planned Stops
                      </span>
                      {weatherAdvisory && (
                        <>
                          <span>•</span>
                          <button
                            type="button"
                            onClick={() => setShowWeatherModal(true)}
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold transition hover:opacity-90 cursor-pointer ${
                              weatherAdvisory.status === "DANGER"
                                ? "bg-rose-100 text-rose-800 border border-rose-300"
                                : weatherAdvisory.status === "CAUTION"
                                ? "bg-amber-100 text-amber-800 border border-amber-300"
                                : "bg-emerald-100 text-emerald-800 border border-emerald-300"
                            }`}
                          >
                            <span>{weatherAdvisory.metrics?.conditionIcon || "🌤️"}</span>
                            <span>{weatherAdvisory.metrics?.currentTemp ? `${weatherAdvisory.metrics.currentTemp}°C` : ""}</span>
                            <span>•</span>
                            <span className="underline decoration-dotted">
                              {weatherAdvisory.status === "DANGER"
                                ? "Hazard Warning"
                                : weatherAdvisory.status === "CAUTION"
                                ? "Weather Advisory"
                                : "Weather & Safety: Safe"}
                            </span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* View Controls: Combined | Map | Schedule */}
                  <div className="flex items-center gap-2">
                    <div className="inline-flex rounded-xl bg-slate-100 p-1 text-xs font-semibold text-slate-600">
                      <button
                        type="button"
                        onClick={() => setViewMode("combined")}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                          viewMode === "combined"
                            ? "bg-white text-slate-900 shadow-sm font-bold"
                            : "hover:text-slate-900"
                        }`}
                      >
                        <Layers className="h-3.5 w-3.5" /> Combined
                      </button>
                      <button
                        type="button"
                        onClick={() => setViewMode("map")}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                          viewMode === "map"
                            ? "bg-white text-slate-900 shadow-sm font-bold"
                            : "hover:text-slate-900"
                        }`}
                      >
                        <MapIcon className="h-3.5 w-3.5" /> Map
                      </button>
                      <button
                        type="button"
                        onClick={() => setViewMode("timeline")}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                          viewMode === "timeline"
                            ? "bg-white text-slate-900 shadow-sm font-bold"
                            : "hover:text-slate-900"
                        }`}
                      >
                        <ListOrdered className="h-3.5 w-3.5" /> Schedule
                      </button>
                    </div>

                    {/* Action Buttons: Share, Print, Save, Weather */}
                    <div className="flex items-center gap-1.5">
                      {weatherAdvisory && (
                        <button
                          type="button"
                          onClick={() => setShowWeatherModal(true)}
                          title="View Weather & Safety Advisory"
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition cursor-pointer"
                        >
                          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                          <span className="hidden sm:inline">Weather Safety</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={handleShare}
                        title="Share link"
                        className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition"
                      >
                        {copiedLink ? <Check className="h-4 w-4 text-emerald-600" /> : <Share2 className="h-4 w-4" />}
                      </button>
                      <button
                        type="button"
                        onClick={handlePrint}
                        title="Print itinerary"
                        className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition"
                      >
                        <Printer className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Weather & Travel Safety Advisory Banner */}
                {weatherAdvisory && (
                  <div
                    className={`mt-5 rounded-2xl border p-4 transition-all duration-300 ${
                      weatherAdvisory.status === "DANGER"
                        ? "border-rose-300 bg-gradient-to-r from-rose-50 to-orange-50/60"
                        : weatherAdvisory.status === "CAUTION"
                        ? "border-amber-300 bg-gradient-to-r from-amber-50 to-yellow-50/60"
                        : "border-emerald-200 bg-gradient-to-r from-emerald-50/80 to-teal-50/40"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div
                          className={`mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl shadow-sm ${
                            weatherAdvisory.status === "DANGER"
                              ? "bg-rose-600 text-white"
                              : weatherAdvisory.status === "CAUTION"
                              ? "bg-amber-500 text-white"
                              : "bg-emerald-600 text-white"
                          }`}
                        >
                          {weatherAdvisory.status === "DANGER" ? (
                            <AlertOctagon className="h-5 w-5" />
                          ) : weatherAdvisory.status === "CAUTION" ? (
                            <AlertTriangle className="h-5 w-5" />
                          ) : (
                            <ShieldCheck className="h-5 w-5" />
                          )}
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${
                                weatherAdvisory.status === "DANGER"
                                  ? "bg-rose-200/80 text-rose-900"
                                  : weatherAdvisory.status === "CAUTION"
                                  ? "bg-amber-200/80 text-amber-900"
                                  : "bg-emerald-200/80 text-emerald-900"
                              }`}
                            >
                              {weatherAdvisory.statusLabel || (weatherAdvisory.status === "SAFE" ? "Safe to Travel · Green Light" : "Travel Weather Advisory")}
                            </span>
                            <span className="text-xs font-semibold text-slate-700">
                              {weatherAdvisory.metrics?.conditionIcon} {weatherAdvisory.metrics?.currentTemp}°C {weatherAdvisory.metrics?.conditionLabel} in {form.destination}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                            {weatherAdvisory.professionalVerdict}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() => setShowWeatherModal(true)}
                          className={`rounded-xl px-3.5 py-2 text-xs font-bold shadow-sm transition active:scale-95 cursor-pointer flex items-center gap-1.5 ${
                            weatherAdvisory.status === "DANGER"
                              ? "bg-rose-700 hover:bg-rose-800 text-white"
                              : weatherAdvisory.status === "CAUTION"
                              ? "bg-amber-600 hover:bg-amber-700 text-white"
                              : "bg-emerald-700 hover:bg-emerald-800 text-white"
                          }`}
                        >
                          <span>Safety Details & Pack Advice</span>
                          <span>→</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Interactive Leaflet Route Map Canvas (Visible in "combined" and "map" modes) */}
                {(viewMode === "combined" || viewMode === "map") && (
                  <div className="mt-5 mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <MapIcon className="h-4 w-4 text-emerald-700" />
                        <h3 className="font-display text-sm font-bold text-slate-900">
                          Interactive Route & Stops Map
                        </h3>
                        {activeDayNumber && (
                          <span className="text-xs bg-slate-100 font-semibold px-2 py-0.5 rounded-md text-slate-700">
                            Day {activeDayNumber} Stops
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500 font-medium">
                        Click markers for details · Switch roadmap / satellite
                      </span>
                    </div>

                    <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
                      <RouteMapCanvas
                        stops={routeStops}
                        destination={form.destination}
                        centerCoords={destinationCenter}
                        activeDayNumber={activeDayNumber}
                        onSelectDay={(dayNum) => setActiveDayNumber(dayNum === "all" ? 1 : Number(dayNum))}
                      />
                    </div>
                  </div>
                )}

                {/* Day-by-Day Schedule Cards (Visible in "combined" and "timeline" modes) */}
                {(viewMode === "combined" || viewMode === "timeline") && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                      <div className="flex items-center gap-2">
                        <ListOrdered className="h-4 w-4 text-slate-700" />
                        <h3 className="font-display text-sm font-bold text-slate-900">
                          Daily Travel Itinerary
                        </h3>
                      </div>
                      <span className="text-[11px] text-slate-500">
                        Click any day to highlight stops on map
                      </span>
                    </div>

                    {plan.days?.map((day, idx) => (
                      <div
                        key={day.id || idx}
                        onClick={() => setActiveDayNumber(day.index)}
                        className={`rounded-2xl transition-all cursor-pointer ${
                          activeDayNumber === day.index
                            ? "ring-2 ring-emerald-600/70 shadow-sm"
                            : "hover:border-slate-300"
                        }`}
                      >
                        <PlanDayPreview
                          day={day}
                          tag={dayTag(day.index, plan.days.length)}
                          defaultExpanded={day.index === activeDayNumber || day.index === 1}
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Bottom Actions: Save to Trips & Regenerate */}
                <div className="mt-8 pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={generate}
                    disabled={generating}
                    className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${generating ? "animate-spin" : ""}`} />
                    <span>Regenerate Itinerary</span>
                  </button>

                  <button
                    type="button"
                    onClick={saveToTrip}
                    disabled={saving}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 hover:bg-emerald-700 text-white px-6 py-2.5 text-xs font-bold transition shadow-sm active:scale-95 disabled:opacity-50"
                  >
                    <Luggage className="h-3.5 w-3.5 text-amber-300" />
                    <span>{saving ? "Saving to Your Trips..." : "Save to My Trips →"}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Weather Safety & Preparedness Advisory Modal */}
      <WeatherAdvisoryModal
        isOpen={showWeatherModal}
        onClose={() => setShowWeatherModal(false)}
        advisory={weatherAdvisory}
        loading={weatherLoading}
        onRefresh={async () => {
          if (!form.destination) return;
          setWeatherLoading(true);
          try {
            const raw = await fetchDestinationWeather(form.destination);
            const advisory = evaluateWeatherSafety(raw, {
              startDate: form.checkIn,
              endDate: form.checkOut,
            });
            setWeatherAdvisory(advisory);
          } finally {
            setWeatherLoading(false);
          }
        }}
      />
    </div>
  );
}
