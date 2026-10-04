import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Heart, Menu, X, Sparkles, User, LogIn } from "lucide-react";
import Logo from "../ui/Logo";
import { getPersona } from "../../theme/personas";

const NAV_LINKS = [
  { label: "AI Planner", to: "/planner", featured: true },
  { label: "Flights", to: "/flights" },
  { label: "Hotels", to: "/hotels" },
  { label: "Activities", to: "/activities" },
  { label: "Transport", to: "/transport" },
  { label: "My Trips", to: "/trips" },
];

export default function Navbar({
  user,
  transparent = false,
  isAuthenticated = Boolean(user),
  onOpenAuth,
}) {
  const location = useLocation();
  const persona = getPersona(user?.persona);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const userName = user?.fullName || user?.name || user?.email?.split("@")[0] || "User";
  const initials = userName
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();


  const isHeaderTransparent = transparent && !scrolled;

  return (
    <>
      <header
        className={`w-full px-4 py-3.5 transition-all duration-300 md:px-8 ${
          transparent
            ? scrolled
              ? "sticky top-0 z-40 bg-[#0a1f18]/90 backdrop-blur-md shadow-md"
              : "absolute inset-x-0 top-0 z-20"
            : "sticky top-0 z-40 border-b border-slate-100 bg-white/95 backdrop-blur-md"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex min-w-0 flex-1 items-center gap-4 md:gap-8">
            <Logo variant={isHeaderTransparent || (transparent && scrolled) ? "light" : "dark"} size="lg" />

            <nav
              className={`hidden flex-wrap items-center gap-1 md:flex ${
                isHeaderTransparent || (transparent && scrolled) ? "text-white/90" : "text-slate-600"
              }`}
            >
              {NAV_LINKS.map((link) => {
                const active = location.pathname === link.to;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
                      active
                        ? isHeaderTransparent || (transparent && scrolled)
                          ? "bg-white/20 text-white font-semibold"
                          : "bg-emerald-50 text-emerald-900 font-semibold"
                        : isHeaderTransparent || (transparent && scrolled)
                        ? "hover:bg-white/10 hover:text-white"
                        : "hover:bg-slate-100 hover:text-slate-900"
                    } ${
                      link.featured
                        ? isHeaderTransparent || (transparent && scrolled)
                          ? "text-amber-300 font-semibold"
                          : "text-emerald-700 font-semibold"
                        : ""
                    }`}
                  >
                    {link.featured && <Sparkles className="h-3.5 w-3.5" />}
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex shrink-0 items-center gap-2.5 sm:gap-4">
            {isAuthenticated ? (
              <>
                <span
                  className={`hidden rounded-full px-3 py-1 text-xs font-semibold sm:inline-block ${
                    isHeaderTransparent || (transparent && scrolled)
                      ? "bg-white/15 text-white border border-white/20"
                      : "bg-emerald-50 text-emerald-800 border border-emerald-100"
                  }`}
                >
                  {persona.label}
                </span>

                <Link
                  to="/wishlist"
                  className={`hidden items-center gap-1.5 text-sm font-medium transition sm:flex ${
                    isHeaderTransparent || (transparent && scrolled)
                      ? "text-white hover:text-rose-300"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                  aria-label="Wishlist"
                >
                  <Heart className="h-4 w-4 text-rose-500" />
                  <span className="hidden lg:inline">Wishlist</span>
                </Link>

                <Link
                  to="/profile"
                  className="grid h-9 w-9 place-items-center rounded-full text-sm font-bold text-white shadow-sm ring-2 ring-white/30 transition hover:scale-105"
                  style={{ backgroundColor: "var(--accent)" }}
                  title={`${user?.fullName || "Account"} (${persona.label})`}
                >
                  {initials}
                </Link>
              </>
            ) : (
              <button
                type="button"
                onClick={() => onOpenAuth?.("login")}
                className="focus-ring flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold text-[#10382b] shadow-md transition hover:-translate-y-0.5 hover:bg-emerald-50 sm:px-5 sm:py-2.5 sm:text-sm"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>Log in / Sign up</span>
              </button>
            )}

            <button
              className={`grid h-9 w-9 place-items-center rounded-xl border transition md:hidden ${
                isHeaderTransparent || (transparent && scrolled)
                  ? "border-white/20 bg-white/10 text-white"
                  : "border-slate-200 bg-white text-slate-700"
              }`}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              onClick={() => setMenuOpen((value) => !value)}
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer navigation */}
      {menuOpen && (
        <div
          className={`fixed inset-x-0 top-[60px] z-30 max-h-[calc(100vh-60px)] overflow-y-auto px-5 py-6 shadow-2xl transition md:hidden ${
            transparent
              ? "bg-[#071913]/95 backdrop-blur-xl border-b border-white/10 text-white"
              : "bg-white border-b border-slate-200 text-slate-800"
          }`}
        >
          <div className="flex flex-col gap-2">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                  location.pathname === link.to
                    ? "bg-emerald-600 text-white"
                    : transparent
                    ? "text-slate-100 hover:bg-white/10"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
                onClick={() => setMenuOpen(false)}
              >
                {link.featured && <Sparkles className="h-4 w-4 text-amber-400" />}
                {link.label}
              </Link>
            ))}

            <Link
              to="/wishlist"
              className={`flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                transparent ? "text-slate-100 hover:bg-white/10" : "text-slate-700 hover:bg-slate-100"
              }`}
              onClick={() => setMenuOpen(false)}
            >
              <Heart className="h-4 w-4 text-rose-500" />
              Wishlist
            </Link>

            {isAuthenticated ? (
              <Link
                to="/profile"
                className={`flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                  transparent ? "text-slate-100 hover:bg-white/10" : "text-slate-700 hover:bg-slate-100"
                }`}
                onClick={() => setMenuOpen(false)}
              >
                <User className="h-4 w-4 text-emerald-400" />
                Profile ({user?.fullName || "Account"})
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onOpenAuth?.("login");
                }}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white shadow-md transition active:scale-95"
              >
                <LogIn className="h-4 w-4" />
                Log in or sign up
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}

