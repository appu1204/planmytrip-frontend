import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  ShieldCheck,
  Send,
  Compass,
  MapPin,
  CheckCircle,
} from "lucide-react";
import Logo from "../ui/Logo";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) return;
    setSubscribed(true);
  };

  return (
    <footer className="mt-20 border-t border-slate-200/80 bg-[#0d211a] text-white">
      {/* Newsletter Banner */}
      <div className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <div className="flex flex-col items-start justify-between gap-6 rounded-3xl bg-gradient-to-r from-emerald-950 via-[#103429] to-[#154637] p-8 shadow-panel sm:flex-row sm:items-center">
            <div className="max-w-xl">
              <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-400">
                <Sparkles className="h-3.5 w-3.5" /> Early Access & Price Drops
              </span>
              <h3 className="mt-2 font-display text-2xl font-bold text-white sm:text-3xl">
                Get curated flight alerts and AI travel blueprints.
              </h3>
              <p className="mt-2 text-sm text-slate-300">
                Join over 45,000+ conscious travelers discovering hidden getaways and hand-crafted
                itineraries. No spam, unsubscribe anytime.
              </p>
            </div>

            <div className="w-full sm:w-auto">
              {subscribed ? (
                <div className="flex items-center gap-2 rounded-2xl bg-white/15 px-5 py-3.5 text-sm font-semibold text-emerald-300 backdrop-blur-md">
                  <CheckCircle className="h-5 w-5 text-emerald-400" />
                  <span>You're in! Check your inbox for the welcome travel guide.</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex w-full flex-col gap-2 sm:flex-row sm:w-80">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full rounded-xl bg-white/10 px-4 py-3 text-sm text-white placeholder:text-slate-400 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                  <button
                    type="submit"
                    className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-amber-400 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-amber-300 active:scale-95"
                  >
                    <span>Join</span>
                    <Send className="h-3.5 w-3.5" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
          {/* Brand Col */}
          <div className="col-span-2 md:col-span-4 lg:col-span-2">
            <Logo variant="light" size="lg" />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">
              PlanMyTrip revolutionizes travel planning with AI-powered day-by-day itineraries,
              real-time environmental safety clearance, and curated verified stays.
            </p>
            <div className="mt-6 flex items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> Bank-Grade SSL
              </span>
              <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1">
                <Compass className="h-3.5 w-3.5 text-amber-400" /> 24/7 Global Assist
              </span>
            </div>
          </div>

          {/* Persona Types */}
          <div>
            <h4 className="font-sans text-xs font-bold uppercase tracking-wider text-slate-300">
              Travel Styles
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-400">
              <li>
                <Link to="/onboarding/persona" className="transition hover:text-white">
                  Solo Explorer
                </Link>
              </li>
              <li>
                <Link to="/onboarding/persona" className="transition hover:text-white">
                  Couple & Romantic
                </Link>
              </li>
              <li>
                <Link to="/onboarding/persona" className="transition hover:text-white">
                  Family Vacations
                </Link>
              </li>
              <li>
                <Link to="/onboarding/persona" className="transition hover:text-white">
                  Friends & Group Escapes
                </Link>
              </li>
              <li>
                <Link to="/onboarding/persona" className="transition hover:text-white">
                  Adventure & Treks
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-sans text-xs font-bold uppercase tracking-wider text-slate-300">
              Planning & Booking
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-400">
              <li>
                <Link to="/planner" className="flex items-center gap-1.5 transition hover:text-amber-300">
                  <Sparkles className="h-3.5 w-3.5 text-amber-400" /> AI Trip Planner
                </Link>
              </li>
              <li>
                <Link to="/trips/new" className="transition hover:text-white">
                  Create New Trip
                </Link>
              </li>
              <li>
                <Link to="/flights" className="transition hover:text-white">
                  Flights Search
                </Link>
              </li>
              <li>
                <Link to="/hotels" className="transition hover:text-white">
                  Verified Stays
                </Link>
              </li>
              <li>
                <Link to="/wishlist" className="transition hover:text-white">
                  Saved Wishlist
                </Link>
              </li>
            </ul>
          </div>

          {/* Top Destinations */}
          <div>
            <h4 className="font-sans text-xs font-bold uppercase tracking-wider text-slate-300">
              Popular Spots
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-400">
              <li>
                <Link to="/trips/new" state={{ destination: "Kyoto, Japan" }} className="flex items-center gap-1 transition hover:text-white">
                  <MapPin className="h-3 w-3 text-emerald-400" /> Kyoto, Japan
                </Link>
              </li>
              <li>
                <Link to="/trips/new" state={{ destination: "Bali, Indonesia" }} className="flex items-center gap-1 transition hover:text-white">
                  <MapPin className="h-3 w-3 text-emerald-400" /> Bali, Indonesia
                </Link>
              </li>
              <li>
                <Link to="/trips/new" state={{ destination: "Swiss Alps, Switzerland" }} className="flex items-center gap-1 transition hover:text-white">
                  <MapPin className="h-3 w-3 text-emerald-400" /> Swiss Alps
                </Link>
              </li>
              <li>
                <Link to="/trips/new" state={{ destination: "Kerala, India" }} className="flex items-center gap-1 transition hover:text-white">
                  <MapPin className="h-3 w-3 text-emerald-400" /> Kerala, India
                </Link>
              </li>
              <li>
                <Link to="/trips/new" state={{ destination: "Santorini, Greece" }} className="flex items-center gap-1 transition hover:text-white">
                  <MapPin className="h-3 w-3 text-emerald-400" /> Santorini, Greece
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright & legal */}
        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-xs text-slate-400 sm:flex-row">
          <div>
            © {new Date().getFullYear()} PlanMyTrip Inc. All rights reserved.
          </div>
          <div className="flex flex-wrap items-center gap-6">
            <span className="cursor-pointer hover:text-white">Privacy Policy</span>
            <span className="cursor-pointer hover:text-white">Terms of Service</span>
            <span className="cursor-pointer hover:text-white">Security & Trust</span>
            <span className="cursor-pointer hover:text-white">Cookie Settings</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
