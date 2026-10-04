import { Navigation, Clock } from "lucide-react";


export default function RouteStopList({ stops = [] }) {
  if (!stops.length) {
    return (
      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-card text-center text-xs text-slate-400">
        No stops generated yet.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-card">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Itinerary Stops</span>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
          {stops.length} stops
        </span>
      </div>

      <div className="mt-4 max-h-[500px] overflow-y-auto pr-1 space-y-0 scrollbar-thin">
        {stops.map((stop, i) => {
          const isFirst = i === 0;
          const isLast = i === stops.length - 1 && stops.length > 1;
          const pinColor = isFirst ? "bg-emerald-500" : isLast ? "bg-orange-500" : "bg-blue-600";
          const googleDirUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
            `${stop.name}, ${stop.destination || ""}`
          )}`;

          return (
            <div key={stop.id || `stop-${i}`} className="relative flex gap-3 pb-5 last:pb-1 group">
              {/* Connector line */}
              {i < stops.length - 1 && (
                <span className="absolute left-[13px] top-6 h-full w-0.5 bg-slate-200" aria-hidden="true" />
              )}

              {/* Numbered Pin Badge */}
              <div
                className={`relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white shadow-sm ${pinColor}`}
              >
                {stop.stopIndex || i + 1}
              </div>

              <div className="min-w-0 flex-1 pt-0.5">
                <div className="flex items-start justify-between gap-1">
                  <div className="truncate text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition">
                    {stop.name}
                  </div>
                  <a
                    href={googleDirUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-blue-600 transition"
                    title="Navigate in Google Maps"
                  >
                    <Navigation className="h-3.5 w-3.5" />
                  </a>
                </div>

                <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-slate-400">
                  <span className="font-medium text-slate-500">{stop.dayLabel}</span>
                  {stop.time && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {stop.time}
                    </span>
                  )}
                </div>

                {stop.note && (
                  <div className="mt-1 line-clamp-2 text-xs text-slate-500 leading-relaxed">
                    {stop.note}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
