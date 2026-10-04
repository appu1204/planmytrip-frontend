import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  ChevronLeft,
  ChevronRight,
  Flame,
  Waves,
  Mountain,
  Heart,
  Baby,
  Landmark,
  CheckCircle2,
  Plane,
  Luggage,
  Percent,
  Copy,
  Check,
  Plus,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Smartphone,
  CreditCard,
  Lock,
  Tag,
  X,
  Clock,
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

const DESTINATION_CATEGORIES = [
  { key: "all", label: "All Curated", icon: Sparkles },
  { key: "trending", label: "Trending Now", icon: Flame },
  { key: "beach", label: "Beach & Coastal", icon: Waves },
  { key: "mountain", label: "Mountains & Treks", icon: Mountain },
  { key: "romantic", label: "Romantic Escapes", icon: Heart },
  { key: "family", label: "Family Stays", icon: Baby },
  { key: "culture", label: "Heritage & Culture", icon: Landmark },
];

const PROMO_OFFERS = [
  {
    id: "off-1",
    code: "PLANMYTRIP",
    title: "Flat ₹1,500 Instant Discount",
    desc: "Applicable on all domestic & international flight + hotel bundle bookings.",
    tag: "MOST POPULAR",
    gradient: "from-emerald-700 to-teal-900",
  },
  {
    id: "off-2",
    code: "LUXESTAY",
    title: "Up to 25% Off on 5★ Luxury Stays",
    desc: "Valid on verified heritage havelis, private pool villas & boutique retreats.",
    tag: "HOTELS & RESORTS",
    gradient: "from-blue-700 to-indigo-900",
  },
  {
    id: "off-3",
    code: "ZEROFEE",
    title: "Zero Cancellation Charges",
    desc: "100% full refund on cancellations made up to 24 hours before trip departure.",
    tag: "PEACE OF MIND",
    gradient: "from-purple-800 to-slate-900",
  },
];

const FEATURED_PACKAGES = [
  {
    id: "pkg-1",
    name: "Goa Beachfront Villa & Catamaran Cruise",
    destination: "North & South Goa, India",
    duration: "4 Nights / 5 Days",
    rating: 4.88,
    reviewsCount: 340,
    price: "₹14,999",
    originalPrice: "₹19,999",
    emi: "₹1,250/mo",
    inclusions: ["Flights", "4★ Resort Stay", "Daily Breakfast", "Airport Transfers", "Sunset Cruise"],
    image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80",
    badge: "BESTSELLER",
  },
  {
    id: "pkg-2",
    name: "Kerala Backwaters & Munnar Mist Trail",
    destination: "Munnar & Alleppey, India",
    duration: "5 Nights / 6 Days",
    rating: 4.93,
    reviewsCount: 520,
    price: "₹18,499",
    originalPrice: "₹24,000",
    emi: "₹1,540/mo",
    inclusions: ["Houseboat Stay", "Private Cab", "Tea Garden Tour", "All Meals Included"],
    image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80",
    badge: "FAMILY FAVORITE",
  },
  {
    id: "pkg-3",
    name: "Dubai Skyline, Desert Safari & Marina Yacht",
    destination: "Dubai, UAE",
    duration: "5 Nights / 6 Days",
    rating: 4.91,
    reviewsCount: 410,
    price: "₹46,999",
    originalPrice: "₹58,000",
    emi: "₹3,900/mo",
    inclusions: ["Flights Included", "4★ City Hotel", "Desert Safari BBQ", "Burj Khalifa 124th Fl", "Visa Assist"],
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80",
    badge: "INTERNATIONAL",
  },
  {
    id: "pkg-4",
    name: "Kashmir Paradise & Gulmarg Gondola Escape",
    destination: "Srinagar & Gulmarg, India",
    duration: "5 Nights / 6 Days",
    rating: 4.95,
    reviewsCount: 290,
    price: "₹22,999",
    originalPrice: "₹31,000",
    emi: "₹1,910/mo",
    inclusions: ["Dal Lake Houseboat", "Gulmarg Gondola Pass", "Private Sedan", "Breakfast & Dinner"],
    image: "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=800&q=80",
    badge: "TOP RATED",
  },
];

const TOP_FLIGHT_ROUTES = [
  { from: "New Delhi (DEL)", to: "Goa (GOI)", duration: "2h 20m", type: "Non-Stop", price: "₹3,899", airline: "IndiGo / Air India" },
  { from: "Mumbai (BOM)", to: "Dubai (DXB)", duration: "3h 15m", type: "Non-Stop", price: "₹11,499", airline: "Emirates / Air India" },
  { from: "Bengaluru (BLR)", to: "Singapore (SIN)", duration: "4h 10m", type: "Non-Stop", price: "₹13,999", airline: "Singapore Airlines" },
  { from: "New Delhi (DEL)", to: "Srinagar (SXR)", duration: "1h 35m", type: "Non-Stop", price: "₹4,299", airline: "SpiceJet / IndiGo" },
  { from: "Mumbai (BOM)", to: "Bangkok (BKK)", duration: "4h 25m", type: "Non-Stop", price: "₹9,899", airline: "Thai Airways / Vistara" },
  { from: "Chennai (MAA)", to: "Port Blair (IXZ)", duration: "2h 10m", type: "Non-Stop", price: "₹6,499", airline: "Air India" },
];

const TRAVEL_FAQS = [
  {
    q: "How does PlanMyTrip guarantee zero hidden booking fees?",
    a: "Unlike traditional travel portals that add surprise convenience fees at the final payment step, PlanMyTrip shows all-inclusive rates covering base fare, mandatory hotel taxes, and service fees upfront.",
  },
  {
    q: "Can I customize the hotels, flights, and activities in an AI itinerary?",
    a: "Yes! Every AI-generated plan is fully interactive. You can add or remove days, substitute accommodations, drag and reorder stops, and let our route optimizer recalculate your schedule in real time.",
  },
  {
    q: "How does the Weather Clearance and hazard detection work?",
    a: "We integrate direct meteorological radar telemetry. If upcoming weather conditions show storm risks, monsoon floods, or poor mountain air quality during your planned travel dates, the system triggers proactive advisories with alternative indoor suggestions.",
  },
  {
    q: "What happens if I need to cancel my trip?",
    a: "With our Zero Cancellation Guarantee option selected during booking, eligible hotel and package cancellations up to 24 hours prior to check-in are processed with an instant 100% refund directly to your original payment method.",
  },
  {
    q: "Can I share the trip itinerary with my travel companions?",
    a: "Yes! Use our Travel Circle feature to add companions by name or email. They receive a private read/edit link so everyone can inspect the schedule, download boarding vouchers, and view emergency contacts.",
  },
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

const INITIAL_COMMUNITY_FEEDBACK = [
  {
    id: "fb-1",
    author: "Verified Traveler",
    location: "Bengaluru",
    rating: 5,
    tripName: "Kerala Backwaters & Munnar Hills",
    style: "Family",
    comment: "The AI route optimizer grouped our sightseeing spots logically without rushing. Kids enjoyed every single stop.",
    date: "Verified Booking · Oct 2026",
  },
  {
    id: "fb-2",
    author: "Verified Traveler",
    location: "Mumbai",
    rating: 5,
    tripName: "Goa Beachfront Villa & Cruise",
    style: "Friends",
    comment: "Zero convenience fee saved us almost ₹3,000 on our group package. The voucher storage kept everything offline.",
    date: "Verified Booking · Sep 2026",
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
  const [rawDestinations, setRawDestinations] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedReviewCategory, setSelectedReviewCategory] = useState("all");
  const [isDestLoading, setIsDestLoading] = useState(false);
  const [heroFailed, setHeroFailed] = useState(false);
  const [copiedPromo, setCopiedPromo] = useState(null);
  const [faqOpenIndex, setFaqOpenIndex] = useState(0);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [newReviewForm, setNewReviewForm] = useState({
    tripName: "",
    location: "",
    rating: 5,
    style: "Family",
    comment: "",
  });

  const [communityReviews, setCommunityReviews] = useState(() => {
    try {
      const saved = localStorage.getItem("pmt_community_feedback");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // storage disabled
    }
    return INITIAL_COMMUNITY_FEEDBACK;
  });

  const destScrollRef = useRef(null);

  useEffect(() => {
    document.documentElement.dataset.persona = persona.key;
  }, [persona.key]);

  const handleCopyPromo = (code) => {
    navigator.clipboard?.writeText(code);
    setCopiedPromo(code);
    setTimeout(() => setCopiedPromo(null), 2500);
  };

  const handleToggleFaq = (idx) => {
    setFaqOpenIndex(faqOpenIndex === idx ? -1 : idx);
  };

  const handleOpenFeedbackModal = () => {
    if (!isAuthenticated) {
      openAuth("login");
      return;
    }
    setShowFeedbackModal(true);
  };

  const handleSubmitFeedback = (e) => {
    e.preventDefault();
    if (!newReviewForm.tripName.trim() || !newReviewForm.comment.trim()) return;

    const newEntry = {
      id: `fb_${Date.now()}`,
      author: user?.fullName || "Verified Traveler",
      location: newReviewForm.location.trim() || "India",
      rating: newReviewForm.rating,
      tripName: newReviewForm.tripName.trim(),
      style: newReviewForm.style,
      comment: newReviewForm.comment.trim(),
      date: `Verified Booking · ${new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" })}`,
    };

    const updated = [newEntry, ...communityReviews];
    setCommunityReviews(updated);
    try {
      localStorage.setItem("pmt_community_feedback", JSON.stringify(updated));
    } catch {
      // storage disabled
    }

    setShowFeedbackModal(false);
    setNewReviewForm({ tripName: "", location: "", rating: 5, style: "Family", comment: "" });
  };

  // Fetch popular destinations whenever persona changes
  useEffect(() => {
    let cancelled = false;

    getPopularDestinations(persona.key, 12)
      .then((data) => {
        if (cancelled) return;
        const validList = Array.isArray(data) && data.length > 0 ? data : (FALLBACK_DESTINATIONS[persona.key] || []);
        setRawDestinations(validList);
      })
      .catch(() => {
        if (!cancelled) setRawDestinations(FALLBACK_DESTINATIONS[persona.key] || []);
      })
      .finally(() => {
        if (!cancelled) setIsDestLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [persona.key]);

  // Efficiently derive filtered destinations without triggering extra renders
  const destinations = useMemo(() => {
    const baseList = rawDestinations.length > 0 ? rawDestinations : (FALLBACK_DESTINATIONS[persona.key] || []);
    if (!baseList.length) return [];
    if (selectedCategory === "all") return baseList;

    const filtered = baseList.filter((d) => {
      const text = `${d.name} ${d.country} ${d.tag} ${d.highlights ? d.highlights.join(" ") : ""}`.toLowerCase();
      if (selectedCategory === "trending") return (d.popularityRank && d.popularityRank <= 2) || (d.rating && d.rating >= 4.9);
      if (selectedCategory === "beach") return text.includes("beach") || text.includes("island") || text.includes("maldives") || text.includes("goa") || text.includes("phuket") || text.includes("coast") || text.includes("sea");
      if (selectedCategory === "mountain") return text.includes("mountain") || text.includes("alps") || text.includes("trek") || text.includes("switzerland") || text.includes("ladakh") || text.includes("nepal") || text.includes("manali") || text.includes("annapurna");
      if (selectedCategory === "romantic") return d.persona === "COUPLE" || text.includes("romantic") || text.includes("sunset") || text.includes("santorini") || text.includes("paris") || text.includes("villas");
      if (selectedCategory === "family") return d.persona === "FAMILY" || text.includes("family") || text.includes("park") || text.includes("kerala") || text.includes("singapore");
      if (selectedCategory === "culture") return text.includes("temple") || text.includes("culture") || text.includes("kyoto") || text.includes("heritage") || text.includes("barcelona") || text.includes("lisbon") || text.includes("udaipur");
      return true;
    });

    return filtered.length > 0 ? filtered : baseList;
  }, [rawDestinations, persona.key, selectedCategory]);

  const changePersona = (key) => {
    setIsDestLoading(true);
    setActivePersonaKey(key);
  };

  const scrollDestinations = (direction) => {
    if (destScrollRef.current) {
      const scrollAmount = direction === "left" ? -340 : 340;
      destScrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

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
                      onClick={() => changePersona(p.key)}
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
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700">
              <Compass className="h-4 w-4" /> Top Curated Escapes
            </div>
            <h2 className="mt-1 font-display text-2xl font-bold text-slate-900 sm:text-3xl">
              Popular Destinations{" "}
              <span className="text-emerald-700">
                {isAuthenticated ? persona.home.sectionLabel : `for ${persona.label} Travelers`}
              </span>
            </h2>
            <p className="mt-1 text-xs text-slate-500 sm:text-sm">
              Click any destination to inspect weather windows, highlights, and generate an instant AI itinerary.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Scroll Navigation Buttons for Desktop */}
            <div className="hidden sm:flex items-center gap-1.5 mr-2">
              <button
                type="button"
                onClick={() => scrollDestinations("left")}
                aria-label="Previous destinations"
                className="grid h-9 w-9 place-items-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-100 hover:scale-105 active:scale-95"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => scrollDestinations("right")}
                aria-label="Next destinations"
                className="grid h-9 w-9 place-items-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-100 hover:scale-105 active:scale-95"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <Link
              to="/planner"
              className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:opacity-90"
              style={{ backgroundColor: "var(--brand)" }}
            >
              <Sparkles className="h-3.5 w-3.5" /> Plan Custom Trip →
            </Link>
          </div>
        </div>

        {/* Category Filter Chips Bar */}
        <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-100 no-scrollbar">
          {DESTINATION_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.key;
            return (
              <button
                key={cat.key}
                type="button"
                onClick={() => setSelectedCategory(cat.key)}
                className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                  isSelected
                    ? "bg-slate-900 text-white shadow-md scale-105"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isSelected ? "text-amber-300" : "text-slate-500"}`} />
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Horizontal scroll container with custom scrollbar */}
        <div className="mt-5">
          {isDestLoading ? (
            <div className="flex gap-5 overflow-hidden pb-4 pt-1">
              {[...Array(4)].map((_, idx) => (
                <div
                  key={idx}
                  className="h-80 w-64 shrink-0 animate-pulse rounded-3xl bg-slate-100 sm:h-96 sm:w-72"
                />
              ))}
            </div>
          ) : destinations.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
              No destinations match this filter. Showing all curated escapes.
            </div>
          ) : (
            <div
              ref={destScrollRef}
              className="flex gap-5 overflow-x-auto pb-4 pt-1 scroll-smooth"
            >
              {destinations.map((d, i) => (
                <DestinationCard
                  key={d.id || d.name}
                  destination={d}
                  index={i}
                  onOpenAuth={openAuth}
                />
              ))}
            </div>
          )}
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

      {/* 1. Promotional Offers & Bank Coupon Vouchers */}
      <section className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 border border-emerald-200">
              <Percent className="h-3.5 w-3.5 text-emerald-600" /> Member Privileges & Bank Codes
            </div>
            <h2 className="mt-2 font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Exclusive Travel Vouchers & Deals
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Apply active promo codes at checkout for instant fare discounts across hotels, flights, and curated holiday packages.
            </p>
          </div>
          {copiedPromo && (
            <div className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-md">
              <Check className="h-4 w-4" /> Code "{copiedPromo}" copied to clipboard!
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PROMO_OFFERS.map((offer) => (
            <div
              key={offer.id}
              className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between"
            >
              <div
                className={`absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r ${offer.gradient}`}
              />
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded-md bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-700">
                    {offer.tag}
                  </span>
                  <Tag className="h-4 w-4 text-slate-400" />
                </div>
                <h3 className="mt-3 text-lg font-bold text-slate-900">{offer.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-600">{offer.desc}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-dashed border-slate-200 flex items-center justify-between">
                <div className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-1.5 font-mono text-xs font-bold text-slate-800 tracking-wider">
                  {offer.code}
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyPromo(offer.code)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-slate-800 active:scale-95"
                >
                  {copiedPromo === offer.code ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" /> Copy Code
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 2. Handpicked Holiday Packages & Bundles */}
      <section className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800 border border-amber-200">
              <Luggage className="h-3.5 w-3.5 text-amber-600" /> All-Inclusive Experiences
            </div>
            <h2 className="mt-2 font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Curated Holiday Packages & Bundles
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Handcrafted vacations featuring verified boutique hotels, guided sightseeing, flights, and zero hidden fees.
            </p>
          </div>
          <button
            onClick={() => navigate("/planner")}
            className="self-start md:self-auto inline-flex items-center gap-2 rounded-xl bg-slate-100 hover:bg-slate-200 px-4 py-2 text-xs font-bold text-slate-800 transition"
          >
            Custom AI Package Builder <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURED_PACKAGES.map((pkg) => (
            <div
              key={pkg.id}
              className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover"
            >
              <div>
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
                  <img
                    src={pkg.image}
                    alt={pkg.name}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute top-3 left-3 rounded-full bg-slate-950/80 backdrop-blur-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                    {pkg.badge}
                  </div>
                  <div className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-md bg-white/90 backdrop-blur-sm px-2 py-0.5 text-[11px] font-bold text-slate-800 shadow-sm">
                    <Clock className="h-3 w-3 text-slate-600" /> {pkg.duration}
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1 font-semibold text-slate-700">
                      <MapPin className="h-3.5 w-3.5 text-emerald-600" /> {pkg.destination}
                    </span>
                    <span className="flex items-center gap-1 font-bold text-amber-500">
                      <Star className="h-3.5 w-3.5 fill-amber-400" /> {pkg.rating} ({pkg.reviewsCount})
                    </span>
                  </div>

                  <h3 className="mt-2 text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition line-clamp-2">
                    {pkg.name}
                  </h3>

                  <div className="mt-3 flex flex-wrap gap-1">
                    {pkg.inclusions.map((inc) => (
                      <span
                        key={inc}
                        className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600"
                      >
                        ✓ {inc}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4 pt-0 mt-3 border-t border-slate-100">
                <div className="flex items-baseline justify-between pt-3">
                  <div>
                    <span className="text-[10px] text-slate-400 line-through mr-1.5">{pkg.originalPrice}</span>
                    <span className="text-base font-bold text-slate-950">{pkg.price}</span>
                    <span className="text-[10px] text-slate-500"> /person</span>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    EMI {pkg.emi}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => navigate(`/planner?dest=${encodeURIComponent(pkg.destination)}`)}
                  className="mt-3 w-full rounded-xl bg-slate-900 hover:bg-emerald-700 py-2.5 text-xs font-bold text-white transition active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="h-3.5 w-3.5 text-amber-400" /> Plan Package with AI
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Trending Flight Corridors & Instant Search */}
      <section className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-800 border border-blue-200">
              <Plane className="h-3.5 w-3.5 text-blue-600" /> Live Airfare Index
            </div>
            <h2 className="mt-2 font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Popular Domestic & International Flight Routes
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Lowest starting fares monitored daily across premier partner airlines with zero extra convenience markups.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Live Fare Monitoring Active
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {TOP_FLIGHT_ROUTES.map((route, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm transition"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                  <Plane className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <span>{route.from.split(" ")[0]}</span>
                    <ArrowRight className="h-3 w-3 text-slate-400" />
                    <span>{route.to.split(" ")[0]}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {route.airline} · {route.duration} ({route.type})
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-sm font-bold text-slate-950">{route.price}</div>
                <button
                  type="button"
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="mt-1 text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
                >
                  Search Flight
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Why Book With PlanMyTrip (Trust Assurance & Commercial Guarantees) */}
      <section className="bg-slate-900 py-16 text-white my-8">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="rounded-full bg-white/10 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-emerald-400 border border-white/10">
              Industry Standard Assurance
            </span>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Why 250,000+ Travelers Choose PlanMyTrip
            </h2>
            <p className="mt-3 text-sm text-slate-300 sm:text-base">
              Engineered with full transparency, zero surprise fees, and live weather safety intelligence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="rounded-2xl bg-white/5 p-6 border border-white/10 backdrop-blur-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 mb-4">
                <CreditCard className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-white">Zero Hidden Charges</h3>
              <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                What you see is what you pay. We never inject surprise convenience fees or checkout markups at payment.
              </p>
            </div>

            <div className="rounded-2xl bg-white/5 p-6 border border-white/10 backdrop-blur-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400 mb-4">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-white">Weather Clearance Shield</h3>
              <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                Live meteorological radar proactively scans your itinerary dates to prevent monsoon disruptions and hazardous treks.
              </p>
            </div>

            <div className="rounded-2xl bg-white/5 p-6 border border-white/10 backdrop-blur-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 mb-4">
                <Lock className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-white">Zero-Fee Cancellation</h3>
              <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                Plans change. Enjoy 100% instant refunds on eligible bookings cancelled up to 24 hours prior to departure.
              </p>
            </div>

            <div className="rounded-2xl bg-white/5 p-6 border border-white/10 backdrop-blur-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400 mb-4">
                <Headset className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-white">24/7 Travel Circle Support</h3>
              <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                Real human travel specialists available on WhatsApp, phone, and in-app chat whenever you need assistance en route.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Real Verified Community Feedback (Interactive Portal with User Submissions) */}
      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3.5 py-1 text-xs font-bold text-emerald-800 border border-emerald-200">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Verified Traveler Community
            </div>
            <h2 className="mt-2 font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Real Traveler Experiences & Trip Notes
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Authentic feedback and itineraries planned with PlanMyTrip. No sponsored testimonials or fake bots.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-800 border border-amber-200">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" /> 4.9 / 5 Overall Traveler Score
            </div>
            <button
              type="button"
              onClick={handleOpenFeedbackModal}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition active:scale-95"
            >
              <Plus className="h-4 w-4" /> Share Your Trip Review
            </button>
          </div>
        </div>

        {/* Style Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 mb-8">
          {[
            { key: "all", label: "All Reviews" },
            { key: "Family", label: "Family Stays" },
            { key: "Friends", label: "Group & Friends" },
            { key: "Solo", label: "Solo Travelers" },
            { key: "Couple", label: "Couples" },
          ].map((rf) => (
            <button
              key={rf.key}
              type="button"
              onClick={() => setSelectedReviewCategory(rf.key)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                selectedReviewCategory === rf.key
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              {rf.label}
            </button>
          ))}
        </div>

        {/* Dynamic Reviews Feed */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {communityReviews
            .filter((rev) => selectedReviewCategory === "all" || rev.style === selectedReviewCategory)
            .map((rev) => (
              <div
                key={rev.id}
                className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-amber-400">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-amber-400" />
                      ))}
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Verified Traveler
                    </span>
                  </div>

                  <div className="mt-3 font-semibold text-sm text-slate-900">{rev.tripName}</div>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600">"{rev.comment}"</p>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
                      {rev.author ? rev.author.charAt(0).toUpperCase() : "T"}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-800">{rev.author}</div>
                      <div className="text-[10px] text-slate-400">{rev.location} · {rev.style}</div>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400">{rev.date}</span>
                </div>
              </div>
            ))}
        </div>
      </section>

      {/* 6. Frequently Asked Questions (Accordion) */}
      <section className="mx-auto max-w-4xl px-6 py-12 lg:px-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
            <HelpCircle className="h-3.5 w-3.5 text-slate-500" /> Clear Answers
          </div>
          <h2 className="mt-2 font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Frequently Asked Questions
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Clear guidelines on booking security, AI customization, cancellation refunds, and safety.
          </p>
        </div>

        <div className="space-y-3">
          {TRAVEL_FAQS.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-slate-200 bg-white overflow-hidden transition"
            >
              <button
                type="button"
                onClick={() => handleToggleFaq(idx)}
                className="w-full flex items-center justify-between p-5 text-left font-semibold text-slate-900 text-sm hover:text-emerald-700 transition"
              >
                <span>{faq.q}</span>
                {faqOpenIndex === idx ? (
                  <ChevronUp className="h-4 w-4 text-slate-500 flex-shrink-0" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-slate-400 flex-shrink-0" />
                )}
              </button>
              {faqOpenIndex === idx && (
                <div className="px-5 pb-5 text-xs leading-relaxed text-slate-600 border-t border-slate-100 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 7. Mobile App Promotion Banner */}
      <section className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        <div className="rounded-3xl border border-emerald-200/60 bg-gradient-to-r from-emerald-50 via-teal-50 to-white p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="flex items-center gap-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md flex-shrink-0">
              <Smartphone className="h-7 w-7" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100/80 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800 mb-1">
                <CheckCircle2 className="h-3 w-3" /> Offline Trip Wallet
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                Carry Your Itinerary Everywhere Without Internet
              </h3>
              <p className="mt-1 text-xs text-slate-600 max-w-xl">
                Store boarding tickets, hotel check-in vouchers, and offline route directions on your mobile. Receive real-time gate change alerts.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-center shadow-sm">
              <div className="text-[10px] uppercase font-bold text-slate-400">Promo Code</div>
              <div className="font-mono text-sm font-bold text-emerald-700">APPFIRST</div>
            </div>
            <button
              onClick={() => alert("PlanMyTrip mobile app download link has been dispatched to your registered SMS/email.")}
              className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-5 py-3 text-xs font-bold transition shadow-sm active:scale-95"
            >
              Get App Link
            </button>
          </div>
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

      {/* Real Traveler Feedback Modal Dialog */}
      {showFeedbackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-100 relative">
            <button
              type="button"
              onClick={() => setShowFeedbackModal(false)}
              className="absolute top-5 right-5 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 border border-emerald-200">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Share Verified Feedback
            </div>
            <h3 className="mt-2 text-xl font-bold text-slate-900">Write Your Trip Review</h3>
            <p className="mt-1 text-xs text-slate-500">
              Your honest feedback helps fellow travelers plan their dream journeys.
            </p>

            <form onSubmit={handleSubmitFeedback} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Trip / Destination Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Manali Snow Trail & Riverside Stay"
                  value={newReviewForm.tripName}
                  onChange={(e) => setNewReviewForm({ ...newReviewForm, tripName: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Your City</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., New Delhi"
                    value={newReviewForm.location}
                    onChange={(e) => setNewReviewForm({ ...newReviewForm, location: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Travel Style</label>
                  <select
                    value={newReviewForm.style}
                    onChange={(e) => setNewReviewForm({ ...newReviewForm, style: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600 bg-white"
                  >
                    <option value="Family">Family</option>
                    <option value="Friends">Friends / Group</option>
                    <option value="Solo">Solo Traveler</option>
                    <option value="Couple">Couple</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Overall Rating</label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewReviewForm({ ...newReviewForm, rating: star })}
                      className="p-1 hover:scale-110 transition"
                    >
                      <Star
                        className={`h-6 w-6 ${
                          star <= newReviewForm.rating
                            ? "fill-amber-400 text-amber-400"
                            : "text-slate-300"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-xs font-bold text-slate-700">
                    {newReviewForm.rating} / 5 Stars
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Your Trip Experience</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Tell us about the itinerary flow, hotel experience, route safety, or any travel tips..."
                  value={newReviewForm.comment}
                  onChange={(e) => setNewReviewForm({ ...newReviewForm, comment: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-3 text-xs focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowFeedbackModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-slate-900 hover:bg-emerald-700 px-5 py-2 text-xs font-bold text-white transition active:scale-95"
                >
                  Submit Verified Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Auth Dialog Modal */}
      {authMode && !isAuthenticated && (
        <AuthDialog mode={authMode} onClose={closeAuth} onModeChange={switchAuthMode} />
      )}
    </div>
  );
}

