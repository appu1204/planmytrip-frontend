export default function PlanDayPreview({ day, tag }) {
  return (
    <div className="rounded-xl border border-slate-100 p-4">
      <div className="flex items-start justify-between gap-3">
        <h4 className="text-sm font-semibold text-slate-900">
          Day {day.index} — {day.label}
        </h4>
        {tag && (
          <span
            className="shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold"
            style={{ backgroundColor: "var(--brand-light)", color: "var(--brand-dark)" }}
          >
            {tag}
          </span>
        )}
      </div>
      <ul className="mt-2 space-y-1 text-sm text-slate-500">
        {day.activities.slice(0, 2).map((a) => (
          <li key={a.id}>· {a.title}</li>
        ))}
      </ul>
    </div>
  );
}
