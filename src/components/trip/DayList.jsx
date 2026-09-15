import { Plus } from "lucide-react";

export default function DayList({ days, activeDayId, onSelect, onAddDay }) {
  return (
    <div className="space-y-4">
      <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Trip days</span>
      <div className="space-y-1.5">
        {days.map((day) => {
          const active = day.id === activeDayId;
          return (
            <button
              key={day.id}
              onClick={() => onSelect(day.id)} // switches the timeline on the right to this day
              className={`focus-ring flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                active ? "text-white" : "text-slate-600 hover:bg-slate-50"
              }`}
              style={active ? { backgroundColor: "var(--brand)" } : undefined}
            >
              <span
                className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold ${
                  active ? "bg-white/20 text-white" : "text-slate-500"
                }`}
                style={!active ? { backgroundColor: "var(--brand-light)" } : undefined}
              >
                {day.index}
              </span>
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold">{day.label}</div>
                <div className={`truncate text-xs ${active ? "text-white/70" : "text-slate-400"}`}>
                  {day.dateLabel}
                </div>
              </div>
            </button>
          );
        })}
      </div>
      <button
        onClick={onAddDay} // appends a new blank day to the itinerary
        className="focus-ring flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-200 py-2.5 text-sm font-semibold text-slate-500 transition hover:border-slate-300 hover:bg-slate-50"
      >
        <Plus className="h-3.5 w-3.5" /> Add day
      </button>
    </div>
  );
}
