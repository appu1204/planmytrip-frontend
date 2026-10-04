import { Check } from "lucide-react";

export default function PreferenceChip({ label, icon, active, onToggle }) {
  const displayLabel = typeof label === "object" ? label.label : label;
  const displayIcon = icon || (typeof label === "object" ? label.icon : null);
  const value = typeof label === "object" ? (label.id || label.label) : label;

  return (
    <button
      type="button"
      onClick={() => onToggle(value)}
      className={`group inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition-all duration-200 select-none whitespace-nowrap active:scale-95 ${
        active
          ? "border-emerald-600 bg-emerald-50 text-emerald-950 shadow-sm ring-1 ring-emerald-500 font-semibold"
          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
      }`}
    >
      {displayIcon && <span className="text-sm shrink-0 leading-none">{displayIcon}</span>}
      <span className="leading-tight">{displayLabel}</span>
      {active && <Check className="h-3.5 w-3.5 text-emerald-700 ml-0.5 shrink-0 stroke-[2.5]" />}
    </button>
  );
}
