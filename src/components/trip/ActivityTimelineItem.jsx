import { X } from "lucide-react";

export default function ActivityTimelineItem({ activity, isLast, onRemove }) {
  return (
    <div className="relative flex gap-4 pb-6">
      {/* Vertical connector line down to the next activity, hidden on the last item */}
      {!isLast && (
        <span className="absolute left-[7px] top-6 h-full w-px bg-slate-200" aria-hidden="true" />
      )}
      <span
        className="relative mt-1.5 h-3.5 w-3.5 shrink-0 rounded-full"
        style={{ backgroundColor: "var(--brand)" }}
      />
      <div className="group flex-1 rounded-xl border border-slate-100 bg-white p-4 shadow-card">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              {activity.time}
            </div>
            <div className="mt-1 text-sm font-semibold text-slate-900">{activity.title}</div>
            {activity.note && <p className="mt-1 text-sm text-slate-500">{activity.note}</p>}
          </div>
          {onRemove && (
            <button
              onClick={() => onRemove(activity.id)} // removes just this activity from the day
              className="focus-ring grid h-7 w-7 shrink-0 place-items-center rounded-full text-slate-300 opacity-0 transition hover:bg-slate-50 hover:text-slate-500 group-hover:opacity-100"
              aria-label="Remove activity"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
