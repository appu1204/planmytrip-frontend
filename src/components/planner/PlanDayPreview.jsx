import { useState } from "react";
import {
  Clock,
  MapPin,
  ChevronDown,
  ChevronUp,
  Sun,
  Sunset,
  Moon,
  Utensils,
  Camera,
  Sparkles,
} from "lucide-react";

function getActivityIcon(title = "", time = "") {
  const text = `${title} ${time}`.toLowerCase();
  if (text.includes("dinner") || text.includes("lunch") || text.includes("breakfast") || text.includes("cafe") || text.includes("food") || text.includes("tasting")) {
    return Utensils;
  }
  if (text.includes("sunset") || text.includes("evening") || text.includes("cruise") || text.includes("beach walk")) {
    return Sunset;
  }
  if (text.includes("night") || text.includes("stargazing") || text.includes("bar")) {
    return Moon;
  }
  if (text.includes("photo") || text.includes("viewpoint") || text.includes("panoramic")) {
    return Camera;
  }
  if (text.includes("morning") || text.includes("sunrise") || text.includes("check-in") || text.includes("hike")) {
    return Sun;
  }
  return MapPin;
}

function getTimeCategory(timeStr = "", idx = 0) {
  const t = timeStr.toLowerCase();
  if (t.includes("am") || t.includes("morning") || idx === 0) return { label: "Morning", color: "bg-amber-50 text-amber-800 border-amber-200" };
  if (t.includes("pm") && (t.includes("12:") || t.includes("1:") || t.includes("2:") || t.includes("3:") || t.includes("afternoon") || idx === 1)) {
    return { label: "Afternoon", color: "bg-blue-50 text-blue-800 border-blue-200" };
  }
  return { label: "Evening", color: "bg-purple-50 text-purple-800 border-purple-200" };
}

export default function PlanDayPreview({ day, tag, defaultExpanded = true }) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const activities = day.activities && day.activities.length > 0 ? day.activities : [];

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm hover:shadow-md transition-all duration-300">
      {/* Day Header */}
      <div
        onClick={() => setExpanded(!expanded)}
        className="flex cursor-pointer items-center justify-between p-4 sm:p-5 bg-gradient-to-r from-slate-50/80 via-white to-slate-50/40 border-b border-slate-100 select-none hover:bg-slate-50 transition"
      >
        <div className="flex items-center gap-3.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white font-display text-sm font-bold shadow-sm">
            D{day.index}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display text-base font-bold text-slate-900">
                {day.label || day.title || `Day ${day.index}`}
              </h3>
              {tag && (
                <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800 border border-emerald-200">
                  <Sparkles className="h-3 w-3 text-emerald-600" /> {tag}
                </span>
              )}
            </div>
            <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
              <span>{day.dateLabel || `Day ${day.index} Schedule`}</span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-600 font-medium">{activities.length} planned stops</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {tag && (
            <span className="sm:hidden inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200">
              {tag}
            </span>
          )}
          <button
            type="button"
            className="grid h-8 w-8 place-items-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
            aria-label={expanded ? "Collapse day" : "Expand day"}
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Activities Timeline */}
      {expanded && (
        <div className="p-4 sm:p-6 bg-white">
          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {activities.map((act, idx) => {
              const Icon = getActivityIcon(act.title, act.time);
              const period = getTimeCategory(act.time, idx);

              return (
                <div key={act.id || idx} className="relative group">
                  {/* Timeline Node Dot */}
                  <div className="absolute -left-[27px] top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-white border-2 border-slate-900 text-slate-900 group-hover:border-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition shadow-sm">
                    <Icon className="h-3 w-3" />
                  </div>

                  <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3.5 hover:bg-emerald-50/30 hover:border-emerald-200/80 transition-all duration-200">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${period.color}`}>
                          {period.label}
                        </span>
                        {act.time && (
                          <span className="flex items-center gap-1 text-xs font-semibold text-slate-500 font-mono">
                            <Clock className="h-3 w-3 text-slate-400" /> {act.time}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-medium text-slate-400">Stop #{idx + 1}</span>
                    </div>

                    <h4 className="mt-2 text-sm font-bold text-slate-900 group-hover:text-emerald-800 transition">
                      {act.title}
                    </h4>

                    {act.note && (
                      <p className="mt-1 text-xs leading-relaxed text-slate-600">
                        {act.note}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
