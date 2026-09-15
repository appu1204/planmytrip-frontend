const TABS = [
  { key: "overview", label: "Overview" }, // trip summary at a glance
  { key: "itinerary", label: "Itinerary" }, // day-by-day plan builder
  { key: "map", label: "Map" }, // route & stops visualised
  { key: "budget", label: "Budget" }, // cost breakdown for the trip
  { key: "documents", label: "Documents" }, // tickets, vouchers, uploads
];

export default function TripTabs({ active, onChange }) {
  return (
    <div className="flex gap-1 border-b border-slate-100">
      {TABS.map((tab) => {
        const isActive = active === tab.key;
        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={`focus-ring -mb-px rounded-t-lg px-4 py-2.5 text-sm font-semibold transition ${
              isActive ? "text-white" : "text-slate-500 hover:text-slate-700"
            }`}
            style={isActive ? { backgroundColor: "var(--brand)" } : undefined}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
