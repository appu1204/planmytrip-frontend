import { useState, useRef, useEffect } from "react";
import { Search, MapPin, Calendar, Sparkles, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

const TRENDING_DESTINATIONS = [
  { name: "Kyoto", country: "Japan", highlight: "Cherry blossoms & temples" },
  { name: "Bali", country: "Indonesia", highlight: "Beaches & culture" },
  { name: "Swiss Alps", country: "Switzerland", highlight: "Mountains & lakes" },
  { name: "Kerala", country: "India", highlight: "Backwaters & wellness" },
  { name: "Goa", country: "India", highlight: "Coastline & sunsets" },
  { name: "Paris", country: "France", highlight: "Romance & architecture" },
];

export default function SearchBar() {
  const navigate = useNavigate();
  const [destination, setDestination] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const containerRef = useRef(null);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const onSearch = (e) => {
    e.preventDefault();
    navigate("/trips/new", { state: { destination, checkIn, checkOut } });
  };

  const selectSuggestion = (s) => {
    setDestination(`${s.name}, ${s.country}`);
    setShowSuggestions(false);
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-3xl">
      <form
        onSubmit={onSearch}
        className="flex w-full flex-col gap-2 rounded-2xl bg-white p-2.5 shadow-panel sm:flex-row sm:items-center sm:gap-0 sm:p-2"
      >
        {/* Where to */}
        <div className="relative flex flex-1 items-center gap-3 rounded-xl px-3.5 py-2.5 hover:bg-slate-50/80 transition sm:rounded-none sm:border-r sm:border-slate-100">
          <MapPin className="h-4 w-4 shrink-0 text-emerald-700" />
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Where to?
            </div>
            <input
              value={destination}
              onFocus={() => setShowSuggestions(true)}
              onChange={(e) => setDestination(e.target.value.replace(/[\r\n]+/g, ", "))}
              placeholder="City, country or island"
              className="w-full bg-transparent text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none"
            />
          </div>
          {destination && (
            <button
              type="button"
              onClick={() => setDestination("")}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
              aria-label="Clear destination"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Check-in */}
        <label className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 hover:bg-slate-50/80 transition sm:rounded-none sm:border-r sm:border-slate-100">
          <Calendar className="h-4 w-4 shrink-0 text-slate-400" />
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Check-in
            </div>
            <input
              type="date"
              min={today}
              value={checkIn}
              onChange={(e) => {
                setCheckIn(e.target.value);
                if (checkOut && new Date(checkOut) <= new Date(e.target.value)) {
                  setCheckOut("");
                }
              }}
              className="bg-transparent text-sm font-medium text-slate-800 focus:outline-none cursor-pointer"
            />
          </div>
        </label>

        {/* Check-out */}
        <label className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 hover:bg-slate-50/80 transition sm:rounded-none">
          <Calendar className="h-4 w-4 shrink-0 text-slate-400" />
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Check-out
            </div>
            <input
              type="date"
              min={checkIn || today}
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="bg-transparent text-sm font-medium text-slate-800 focus:outline-none cursor-pointer"
            />
          </div>
        </label>

        {/* Submit Button */}
        <button
          type="submit"
          className="focus-ring flex items-center justify-center gap-2 rounded-xl px-5 py-3.5 font-semibold text-white transition duration-200 hover:opacity-95 active:scale-95 sm:h-12 sm:w-12 sm:p-0 sm:shrink-0 sm:rounded-xl shadow-md"
          style={{ backgroundColor: "var(--brand)" }}
          aria-label="Search trips"
        >
          <Search className="h-4 w-4" />
          <span className="sm:hidden text-sm">Find Trips & Itineraries</span>
        </button>
      </form>

      {/* Destination Quick Suggestions Popover */}
      {showSuggestions && (
        <div className="absolute left-0 right-0 top-full z-30 mt-2 rounded-2xl border border-slate-100 bg-white p-4 shadow-panel animate-auth-rise-in">
          <div className="mb-2.5 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
            <span className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" /> Popular Ideas
            </span>
            <span className="text-[10px] font-normal lowercase text-slate-400">Click to select</span>
          </div>

          <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
            {TRENDING_DESTINATIONS.map((item) => (
              <button
                key={item.name}
                type="button"
                onClick={() => selectSuggestion(item)}
                className="flex items-start gap-2.5 rounded-xl p-2 text-left transition hover:bg-slate-50"
              >
                <div className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-emerald-50 text-emerald-700">
                  <MapPin className="h-3.5 w-3.5" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900">
                    {item.name}, <span className="font-normal text-slate-500">{item.country}</span>
                  </div>
                  <div className="text-xs text-slate-400">{item.highlight}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

