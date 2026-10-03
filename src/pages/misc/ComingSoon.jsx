import { useState } from "react";
import { Link } from "react-router-dom";
import { CircleCheck, Mail, Sparkles, Home } from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import { useAuth } from "../../context/AuthContext";
import { getPersona } from "../../theme/personas";
import { COMING_SOON_CONTENT } from "../../theme/comingSoonContent";

const BACKDROP_IMAGES = {
  flights: "/images/airliner-clouds.png",
  hotels: "/images/sunset-pool.png",
  transport: "/images/highway-bus.png",
  activities: "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1600&q=80",
};

export default function ComingSoon({ type }) {
  const { user } = useAuth();
  const persona = getPersona(user?.persona);
  const content = COMING_SOON_CONTENT[type] || COMING_SOON_CONTENT.flights;
  const Icon = content.icon;

  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const onNotifyMe = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
  };

  const backdrop = BACKDROP_IMAGES[content.key] || BACKDROP_IMAGES.flights;

  return (
    <div className="min-h-screen bg-[#06100c] text-white">
      <Navbar user={user} transparent />

      <div className="relative flex min-h-screen flex-col overflow-hidden">
        {/* Background layer: high-res backdrop with subtle dark gradient overlay */}
        <div className="absolute inset-0">
          <img
            src={backdrop}
            alt=""
            className="h-full w-full object-cover opacity-35 scale-105 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#06100c] via-[#06100c]/80 to-[#06100c]/40" />
        </div>

        {/* Content layer */}
        <main className="relative z-10 mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-6 py-24 text-center">
          <span className="grid h-16 w-16 place-items-center rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md shadow-lg">
            <Icon className="h-7 w-7 text-white" />
          </span>

          <span className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-emerald-300 backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            {content.eyebrow}
          </span>

          <h1 className="mt-4 font-display text-4xl font-bold leading-tight text-white sm:text-5xl">
            {content.title}
          </h1>

          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-white/80">
            {content.subcopy}
          </p>

          <ul className="mt-8 grid w-full max-w-md gap-3 text-left">
            {content.checklist.map((item) => (
              <li
                key={item}
                className="flex items-start gap-2.5 rounded-xl bg-white/5 p-2.5 text-sm text-white/90 backdrop-blur-sm border border-white/10"
              >
                <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          {subscribed ? (
            <div className="mt-8 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-950/60 px-5 py-3 text-sm font-medium text-emerald-200 backdrop-blur-md">
              <Sparkles className="h-4 w-4 text-amber-400" />
              We'll let you know the moment {content.eyebrow.split("·")[1]?.trim().toLowerCase() || "this"} launches with early member perks!
            </div>
          ) : (
            <form
              onSubmit={onNotifyMe}
              className="mt-8 flex w-full max-w-md flex-col gap-2 rounded-2xl border border-white/15 bg-white/10 p-2 backdrop-blur-md sm:flex-row"
            >
              <label className="flex flex-1 items-center gap-2.5 px-3 py-2">
                <Mail className="h-4 w-4 shrink-0 text-white/60" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none"
                />
              </label>
              <button
                type="submit"
                className="focus-ring shrink-0 rounded-xl bg-amber-400 px-5 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-amber-300"
              >
                Notify me
              </button>
            </form>
          )}

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/planner"
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-emerald-500"
            >
              <Sparkles className="h-4 w-4 text-amber-300" /> Plan with AI instead
            </Link>
            <Link
              to="/home"
              className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/20"
            >
              <Home className="h-4 w-4" /> Back to Home
            </Link>
          </div>

          <p className="mt-8 text-xs text-white/40">
            Tailored for {persona.label.toLowerCase()} travelers · Part of the PlanMyTrip platform
          </p>
        </main>
      </div>
    </div>
  );
}

