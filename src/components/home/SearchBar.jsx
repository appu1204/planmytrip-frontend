import { useState } from "react";
import { Search, MapPin, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function SearchBar() {
  const navigate = useNavigate();
  const [destination, setDestination] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");

  const onSearch = (e) => {
    e.preventDefault();
    navigate("/trips/new", { state: { destination, checkIn, checkOut } });
  };

  return (
    <form
      onSubmit={onSearch}
      className="flex w-full max-w-2xl flex-col gap-3 rounded-2xl bg-white p-3 shadow-panel sm:flex-row sm:items-center sm:gap-0"
    >
      <label className="flex flex-1 items-center gap-3 px-3 py-2 sm:border-r sm:border-slate-100">
        <MapPin className="h-4 w-4 shrink-0 text-slate-400" />
        <div className="min-w-0">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Where to?
          </div>
          <input
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="Explore destinations"
            className="w-full bg-transparent text-sm font-medium text-slate-800 placeholder:text-slate-500 focus:outline-none"
          />
        </div>
      </label>

      <label className="flex items-center gap-3 px-3 py-2 sm:border-r sm:border-slate-100">
        <Calendar className="h-4 w-4 shrink-0 text-slate-400" />
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Check-in
          </div>
          <input
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            className="bg-transparent text-sm font-medium text-slate-800 focus:outline-none"
          />
        </div>
      </label>

      <label className="flex items-center gap-3 px-3 py-2">
        <Calendar className="h-4 w-4 shrink-0 text-slate-400" />
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Check-out
          </div>
          <input
            type="date"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            className="bg-transparent text-sm font-medium text-slate-800 focus:outline-none"
          />
        </div>
      </label>

      <button
        type="submit"
        className="focus-ring grid h-12 w-12 shrink-0 place-items-center self-end rounded-xl text-white sm:self-auto"
        style={{ backgroundColor: "var(--brand)" }}
        aria-label="Search"
      >
        <Search className="h-4 w-4" />
      </button>
    </form>
  );
}
