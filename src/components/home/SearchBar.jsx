import { useState, useRef, useEffect } from "react";
import {
  Search,
  MapPin,
  Calendar,
  Sparkles,
  X,
  Building2,
  Plane,
  Luggage,
  Users,
  Percent,
  ArrowRightLeft,
  ChevronDown,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const TRENDING_DESTINATIONS = [
  { name: "Kyoto", country: "Japan", highlight: "Cherry blossoms & temples" },
  { name: "Bali", country: "Indonesia", highlight: "Beaches & culture" },
  { name: "Swiss Alps", country: "Switzerland", highlight: "Mountains & lakes" },
  { name: "Kerala", country: "India", highlight: "Backwaters & wellness" },
  { name: "Goa", country: "India", highlight: "Coastline & sunsets" },
  { name: "Paris", country: "France", highlight: "Romance & architecture" },
];

const AIRPORT_HUBS = [
  { city: "New Delhi", code: "DEL", airport: "Indira Gandhi Intl Airport" },
  { city: "Mumbai", code: "BOM", airport: "Chhatrapati Shivaji Maharaj Intl" },
  { city: "Bengaluru", code: "BLR", airport: "Kempegowda Intl Airport" },
  { city: "Goa", code: "GOI", airport: "Dabolim / Mopa Airport" },
  { city: "Dubai", code: "DXB", airport: "Dubai International Airport" },
  { city: "Singapore", code: "SIN", airport: "Changi Airport" },
];

export default function SearchBar() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("packages"); // "packages" | "stays" | "flights"

  // Common Fields
  const [destination, setDestination] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [showDestSuggestions, setShowDestSuggestions] = useState(false);

  // Flight specific
  const [flightFrom, setFlightFrom] = useState("New Delhi (DEL)");
  const [flightTo, setFlightTo] = useState("Goa (GOI)");
  const [flightClass, setFlightClass] = useState("Economy");
  const [tripWay, setTripWay] = useState("one-way"); // "one-way" | "round-trip"

  // Guest Counter Popover
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [rooms, setRooms] = useState(1);
  const [showGuestPicker, setShowGuestPicker] = useState(false);

  const containerRef = useRef(null);
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowDestSuggestions(false);
        setShowGuestPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const swapFlightAirports = () => {
    const temp = flightFrom;
    setFlightFrom(flightTo);
    setFlightTo(temp);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (activeTab === "flights") {
      navigate("/flights", {
        state: { from: flightFrom, to: flightTo, date: checkIn, tripWay, flightClass },
      });
      return;
    }

    if (activeTab === "stays") {
      navigate("/planner", {
        state: {
          destination: destination || "Goa, India",
          checkIn,
          checkOut,
          adults,
          children,
          searchMode: "stays",
        },
      });
      return;
    }

    // Default: Holiday Packages / AI Itinerary
    navigate("/planner", {
      state: {
        destination: destination || "Kyoto, Japan",
        checkIn,
        checkOut,
        adults,
        children,
      },
    });
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-4xl">
      {/* Service Tabs (EaseMyTrip / Booking.com Style) */}
      <div className="flex items-center gap-1.5 mb-2.5 overflow-x-auto pb-1 no-scrollbar">
        {[
          { id: "packages", label: "Holiday Packages & AI Trips", icon: Luggage, badge: "AI Powered" },
          { id: "stays", label: "Hotels & Stays", icon: Building2, badge: "Best Rates" },
          { id: "flights", label: "Flights", icon: Plane, badge: "Zero Fee" },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-bold transition-all duration-200 backdrop-blur-md ${
                isActive
                  ? "bg-white text-slate-900 shadow-panel border border-white"
                  : "bg-black/35 text-white/90 hover:bg-black/50 hover:text-white border border-white/10"
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? "text-emerald-700" : "text-amber-300"}`} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                    isActive ? "bg-emerald-100 text-emerald-800" : "bg-white/20 text-white"
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main Search Bar Box */}
      <form
        onSubmit={handleSearch}
        className="rounded-3xl bg-white p-2.5 shadow-panel border border-slate-200/80 transition-all duration-300"
      >
        {activeTab === "flights" ? (
          /* Flight Booking Mode */
          <div className="space-y-2">
            <div className="flex items-center justify-between px-2 pt-1 pb-1 border-b border-slate-100 text-xs">
              <div className="flex items-center gap-3 font-semibold text-slate-700">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="flightTripType"
                    checked={tripWay === "one-way"}
                    onChange={() => setTripWay("one-way")}
                    className="accent-emerald-700"
                  />
                  <span>One Way</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="flightTripType"
                    checked={tripWay === "round-trip"}
                    onChange={() => setTripWay("round-trip")}
                    className="accent-emerald-700"
                  />
                  <span>Round Trip</span>
                </label>
              </div>

              <select
                value={flightClass}
                onChange={(e) => setFlightClass(e.target.value)}
                className="bg-transparent font-semibold text-emerald-800 focus:outline-none cursor-pointer text-xs"
              >
                <option value="Economy">Economy Class</option>
                <option value="Premium Economy">Premium Economy</option>
                <option value="Business">Business Class</option>
              </select>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-1">
              {/* Origin */}
              <div className="relative flex-1 w-full rounded-2xl px-4 py-2 hover:bg-slate-50 transition border border-slate-100">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">From</div>
                <input
                  value={flightFrom}
                  onChange={(e) => setFlightFrom(e.target.value)}
                  className="w-full bg-transparent text-sm font-bold text-slate-900 focus:outline-none"
                  placeholder="Departure city or airport"
                />
              </div>

              {/* Swap Button */}
              <button
                type="button"
                onClick={swapFlightAirports}
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition"
                title="Swap origin & destination"
              >
                <ArrowRightLeft className="h-3.5 w-3.5" />
              </button>

              {/* Destination */}
              <div className="relative flex-1 w-full rounded-2xl px-4 py-2 hover:bg-slate-50 transition border border-slate-100">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">To</div>
                <input
                  value={flightTo}
                  onChange={(e) => setFlightTo(e.target.value)}
                  className="w-full bg-transparent text-sm font-bold text-slate-900 focus:outline-none"
                  placeholder="Arrival city or airport"
                />
              </div>

              {/* Departure Date */}
              <div className="flex-1 w-full rounded-2xl px-4 py-2 hover:bg-slate-50 transition border border-slate-100">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Departure</div>
                <input
                  type="date"
                  min={today}
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="w-full bg-transparent text-sm font-bold text-slate-900 focus:outline-none cursor-pointer"
                />
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white px-6 py-3.5 text-xs font-bold transition shadow-md shrink-0"
              >
                <Search className="h-4 w-4" />
                <span>Search Flights</span>
              </button>
            </div>

            {/* Quick Popular Airport Hubs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pt-1 text-[11px] text-slate-500 no-scrollbar">
              <span className="font-semibold text-slate-400 shrink-0">Popular:</span>
              {AIRPORT_HUBS.map((hub) => (
                <button
                  key={hub.code}
                  type="button"
                  onClick={() => setFlightTo(`${hub.city} (${hub.code})`)}
                  className="rounded-lg bg-slate-100 px-2 py-0.5 text-slate-700 hover:bg-slate-200 transition shrink-0"
                >
                  {hub.city} ({hub.code})
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Stays & Holiday Packages Mode */
          <div className="flex flex-col sm:flex-row items-center gap-1">
            {/* Where to */}
            <div className="relative flex-1 w-full rounded-2xl px-3.5 py-2 hover:bg-slate-50 transition border border-slate-100 sm:border-none">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0 text-emerald-700" />
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {activeTab === "stays" ? "City, Hotel or Resort" : "Where to?"}
                  </div>
                  <input
                    value={destination}
                    onFocus={() => setShowDestSuggestions(true)}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder={activeTab === "stays" ? "e.g. Goa, Maldives, Dubai" : "e.g. Kyoto, Japan or Kerala"}
                    className="w-full bg-transparent text-sm font-bold text-slate-900 placeholder:text-slate-400 placeholder:font-normal focus:outline-none"
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
            </div>

            <div className="hidden sm:block h-8 w-px bg-slate-200" />

            {/* Check-in */}
            <label className="flex-1 w-full rounded-2xl px-3.5 py-2 hover:bg-slate-50 transition border border-slate-100 sm:border-none cursor-pointer">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 shrink-0 text-slate-400" />
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {activeTab === "stays" ? "Check-in" : "Start Date"}
                  </div>
                  <input
                    type="date"
                    min={today}
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="w-full bg-transparent text-sm font-semibold text-slate-800 focus:outline-none cursor-pointer"
                  />
                </div>
              </div>
            </label>

            <div className="hidden sm:block h-8 w-px bg-slate-200" />

            {/* Check-out */}
            <label className="flex-1 w-full rounded-2xl px-3.5 py-2 hover:bg-slate-50 transition border border-slate-100 sm:border-none cursor-pointer">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 shrink-0 text-slate-400" />
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {activeTab === "stays" ? "Check-out" : "End Date"}
                  </div>
                  <input
                    type="date"
                    min={checkIn || today}
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full bg-transparent text-sm font-semibold text-slate-800 focus:outline-none cursor-pointer"
                  />
                </div>
              </div>
            </label>

            <div className="hidden sm:block h-8 w-px bg-slate-200" />

            {/* Guests & Rooms Selector */}
            <div className="relative flex-1 w-full rounded-2xl px-3.5 py-2 hover:bg-slate-50 transition border border-slate-100 sm:border-none">
              <button
                type="button"
                onClick={() => setShowGuestPicker(!showGuestPicker)}
                className="w-full flex items-center justify-between text-left focus:outline-none"
              >
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 shrink-0 text-slate-400" />
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Travelers & Rooms
                    </div>
                    <div className="text-xs font-semibold text-slate-900 truncate">
                      {adults + children} Guests · {rooms} Room{rooms > 1 ? "s" : ""}
                    </div>
                  </div>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              </button>

              {/* Guest Picker Popover */}
              {showGuestPicker && (
                <div className="absolute left-0 right-0 top-full z-40 mt-2 w-64 rounded-2xl border border-slate-100 bg-white p-4 shadow-panel animate-auth-rise-in">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-slate-800">Adults</div>
                        <div className="text-[10px] text-slate-400">Age 13+</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setAdults(Math.max(1, adults - 1))}
                          className="h-7 w-7 rounded-full border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold"
                        >
                          -
                        </button>
                        <span className="w-5 text-center text-xs font-bold">{adults}</span>
                        <button
                          type="button"
                          onClick={() => setAdults(adults + 1)}
                          className="h-7 w-7 rounded-full border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-slate-800">Children</div>
                        <div className="text-[10px] text-slate-400">Age 0-12</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setChildren(Math.max(0, children - 1))}
                          className="h-7 w-7 rounded-full border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold"
                        >
                          -
                        </button>
                        <span className="w-5 text-center text-xs font-bold">{children}</span>
                        <button
                          type="button"
                          onClick={() => setChildren(children + 1)}
                          className="h-7 w-7 rounded-full border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-100 pt-2">
                      <div>
                        <div className="text-xs font-bold text-slate-800">Rooms</div>
                        <div className="text-[10px] text-slate-400">Number of rooms</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setRooms(Math.max(1, rooms - 1))}
                          className="h-7 w-7 rounded-full border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold"
                        >
                          -
                        </button>
                        <span className="w-5 text-center text-xs font-bold">{rooms}</span>
                        <button
                          type="button"
                          onClick={() => setRooms(rooms + 1)}
                          className="h-7 w-7 rounded-full border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowGuestPicker(false)}
                      className="w-full rounded-xl bg-slate-900 py-2 text-xs font-bold text-white hover:bg-slate-800"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Search CTA */}
            <button
              type="submit"
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl px-6 py-3.5 font-bold text-white transition duration-200 hover:opacity-95 active:scale-95 shadow-md shrink-0 text-xs"
              style={{ backgroundColor: "var(--brand)" }}
            >
              <Search className="h-4 w-4" />
              <span>{activeTab === "stays" ? "Search Stays" : "Build Itinerary"}</span>
            </button>
          </div>
        )}
      </form>

      {/* Offers & Perks Strip (EaseMyTrip / Booking.com Style) */}
      <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 px-3 text-xs text-white/90">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 rounded-full bg-amber-400/20 text-amber-300 px-2 py-0.5 text-[10px] font-bold border border-amber-400/30">
            <Percent className="h-3 w-3" /> PROMO
          </span>
          <span className="text-[11px]">
            Use code <strong className="text-amber-300 font-mono">PLANMYTRIP</strong> for flat ₹1,200 OFF on holiday packages
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-3 text-[11px] text-white/80">
          <span>✓ Zero Cancellation Fee Option</span>
          <span>✓ 100% Verified Stays</span>
        </div>
      </div>

      {/* Destination Quick Suggestions Popover */}
      {showDestSuggestions && (
        <div className="absolute left-0 right-0 top-full z-40 mt-2 rounded-2xl border border-slate-100 bg-white p-4 shadow-panel animate-auth-rise-in">
          <div className="mb-2.5 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
            <span className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" /> Trending Getaways
            </span>
            <span className="text-[10px] font-normal lowercase text-slate-400">Click to select</span>
          </div>

          <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
            {TRENDING_DESTINATIONS.map((item) => (
              <button
                key={item.name}
                type="button"
                onClick={() => {
                  setDestination(`${item.name}, ${item.country}`);
                  setShowDestSuggestions(false);
                }}
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


