import { useEffect, useState } from "react";
import { Sparkles, ShieldCheck, Users, Layers, Headset } from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import SearchBar from "../../components/home/SearchBar";
import QuickActions from "../../components/home/QuickActions";
import DestinationCard from "../../components/home/DestinationCard";
import TrustBadge from "../../components/home/TrustBadge";
import FeatureCard from "../../components/home/FeatureCard";
import { useAuth } from "../../context/AuthContext";
import { getPersona } from "../../theme/personas";
import { FALLBACK_DESTINATIONS } from "../../theme/destinationFallback";
import { getPopularDestinations } from "../../api/destinations";

// Drop your own photo at public/images/hero-<persona>.jpg (no text baked in —
// everything you read on top of it is rendered by this page) and it's
// picked up automatically. Until then this falls back to a brand gradient.
const heroImagePath = (personaKey) => `/images/hero-${personaKey}.jpg`;

const TRUST_ITEMS = [
  { icon: ShieldCheck, title: "Safe & Secure", subtitle: "Travel with peace of mind" },
  { icon: Users, title: "Built for you", subtitle: "Experiences for every trip type" },
  { icon: Layers, title: "Best Prices", subtitle: "Great deals, no hidden fees" },
  { icon: Headset, title: "24/7 Support", subtitle: "We're here for you" },
];

export default function Home() {
  const { user } = useAuth();
  const persona = getPersona(user?.persona);
  const [destinations, setDestinations] = useState(FALLBACK_DESTINATIONS[persona.key] || []);
  const [heroFailed, setHeroFailed] = useState(false);

  useEffect(() => {
    document.documentElement.dataset.persona = persona.key;
  }, [persona.key]);

  useEffect(() => {
    let cancelled = false;
    getPopularDestinations(persona.key, 5)
      .then((data) => {
        if (!cancelled && Array.isArray(data) && data.length) setDestinations(data);
      })
      .catch(() => {
        // Keep the fallback list — the section should never look empty.
      });
    return () => {
      cancelled = true;
    };
  }, [persona.key]);

  const firstName = (user?.fullName || "PlanMyTrip Demo").split(" ")[0];

  return (
    <div className="min-h-screen bg-[#f6f5f1]">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <Navbar user={user} transparent />

        <div className="relative min-h-[600px]">
          {!heroFailed ? (
            <img
              src={heroImagePath(persona.key)}
              alt=""
              onError={() => setHeroFailed(true)}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `linear-gradient(135deg, var(--brand-dark), var(--brand-mid))`,
              }}
            />
          )}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(90deg, rgba(6,15,11,0.82) 10%, rgba(6,15,11,0.35) 55%, rgba(6,15,11,0.15) 100%)",
            }}
          />

          <div className="relative flex min-h-[600px] flex-col justify-center gap-8 px-8 pb-16 pt-28 sm:px-14">
            <div>
              <span className="mb-5 inline-block rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-white">
                {persona.home.badge}
              </span>
              <h1 className="max-w-xl font-display text-5xl font-semibold leading-[1.05] text-white">
                {persona.home.headlinePrefix}{" "}
                <span className="italic" style={{ color: "var(--accent)" }}>
                  {persona.home.headlineAccent}
                </span>
              </h1>
              <p className="mt-4 max-w-lg text-[15px] text-white/80">
                {persona.home.subcopy} Planned around {firstName}'s circle.
              </p>
            </div>

            <SearchBar />
            <QuickActions />
          </div>
        </div>
      </div>

      {/* Popular destinations — overlaps hero bottom edge like the reference design */}
      <div className="relative z-10 mx-4 -mt-10 rounded-2xl bg-white p-6 shadow-panel sm:mx-10 sm:p-8">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold text-slate-900">
            Popular Destinations{" "}
            <span style={{ color: "var(--brand)" }}>{persona.home.sectionLabel}</span>
          </h2>
          <button className="text-sm font-semibold" style={{ color: "var(--brand)" }}>
            View all →
          </button>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {destinations.map((d, i) => (
            <DestinationCard key={d.id || d.name} destination={d} index={i} />
          ))}
        </div>
      </div>

      {/* Trust strip */}
      <div className="mx-4 mt-10 grid grid-cols-2 gap-6 sm:mx-10 lg:grid-cols-4">
        {TRUST_ITEMS.map((item) => (
          <TrustBadge key={item.title} {...item} />
        ))}
      </div>

      {/* Feature section */}
      <div className="mx-auto max-w-5xl px-6 py-20 text-center">
        <span
          className="text-xs font-bold uppercase tracking-widest"
          style={{ color: "var(--brand)" }}
        >
          Built for {firstName}'s {persona.key === "family" ? "family" : "trips"}
        </span>
        <h2 className="mx-auto mt-3 max-w-2xl font-display text-3xl font-semibold text-slate-900">
          Everything a great trip needs, in one place
        </h2>

        <div className="mt-10 grid grid-cols-1 gap-6 text-left sm:grid-cols-3">
          <FeatureCard
            icon={Sparkles}
            iconBg="bg-emerald-50 text-emerald-600"
            title="AI itinerary in minutes"
            description="Tell us dates, budget and what you love — get a full day-by-day plan instantly."
          />
          <FeatureCard
            icon={ShieldCheck}
            iconBg="bg-orange-50 text-orange-600"
            title="Verified, safe stays"
            description="Every hotel is screened for safety, comfort, and the amenities that matter to you."
          />
          <FeatureCard
            icon={Users}
            iconBg="bg-pink-50 text-pink-600"
            title="Plan together, in real time"
            description="Invite your circle to vote on stops and edit the trip together, live."
          />
        </div>
      </div>
    </div>
  );
}
