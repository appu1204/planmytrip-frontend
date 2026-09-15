import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Heart, Bell, Menu, X } from "lucide-react";
import Logo from "../ui/Logo";
import { getPersona } from "../../theme/personas";

const NAV_LINKS = [
  { label: "Flights", to: "/flights" },
  { label: "Hotels", to: "/hotels" },
  { label: "Activities", to: "/activities" },
  { label: "Transport", to: "/transport" },
  { label: "My trips", to: "/trips" },
];

export default function Navbar({ user, transparent = false }) {
  const location = useLocation();
  const persona = getPersona(user?.persona);
  const [menuOpen, setMenuOpen] = useState(false);
  const initials = (user?.fullName || "PlanMyTrip Demo")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <>
      <header
        className={`w-full px-4 py-4 md:px-8 ${
          transparent ? "absolute inset-x-0 top-0 z-20" : "border-b border-slate-100 bg-white"
        }`}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 flex-1 items-center gap-4 md:gap-8">
            <Logo variant={transparent ? "light" : "dark"} size="lg" />

            <nav className={`hidden flex-wrap items-center gap-1 md:flex ${transparent ? "text-white/90" : "text-slate-600"}`}>
              {NAV_LINKS.map((link) => {
                const active = location.pathname === link.to;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`rounded-full px-3 py-2 text-sm font-medium transition md:px-4 ${
                      active
                        ? transparent
                          ? "bg-white/15 text-white"
                          : ""
                        : transparent
                        ? "hover:bg-white/10"
                        : "hover:bg-slate-50"
                    }`}
                    style={active && !transparent ? { backgroundColor: "var(--brand-light)", color: "var(--brand-dark)" } : undefined}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex shrink-0 items-center gap-3 md:gap-4">
            <span
              className={`hidden rounded-full px-3 py-1.5 text-xs font-semibold sm:inline-block ${
                transparent ? "bg-white/10 text-white" : ""
              }`}
              style={!transparent ? { backgroundColor: "var(--brand-light)", color: "var(--brand-dark)" } : undefined}
            >
              {persona.label}
            </span>

            <button
              className={`grid h-9 w-9 place-items-center rounded-full transition ${
                transparent ? "text-white hover:bg-white/10" : "text-slate-500 hover:bg-slate-50"
              }`}
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
            </button>

            <Link
              to="/wishlist"
              className={`hidden items-center gap-1.5 text-sm font-medium sm:flex ${
                transparent ? "text-white" : "text-slate-600"
              }`}
            >
              <Heart className="h-4 w-4" /> Wishlist
            </Link>

            <Link
              to="/profile"
              className="grid h-9 w-9 place-items-center rounded-full text-sm font-semibold text-white"
              style={{ backgroundColor: "var(--accent)" }}
            >
              {initials}
            </Link>

            <button
              className={`grid h-9 w-9 place-items-center rounded-full border border-white/10 md:hidden ${
                transparent ? "text-white" : "text-slate-700"
              }`}
              aria-label="Open menu"
              onClick={() => setMenuOpen((value) => !value)}
            >
              {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </header>

      {menuOpen && (
        <nav className={`md:hidden ${transparent ? "bg-black/70" : "bg-white"} px-4 pb-4`}>
          <div className="flex flex-col gap-2">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`rounded-lg px-4 py-2 text-sm font-medium ${
                  location.pathname === link.to ? "bg-[var(--brand-light)] text-[var(--brand-dark)]" : "text-slate-600"
                }`}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </>
  );
}
