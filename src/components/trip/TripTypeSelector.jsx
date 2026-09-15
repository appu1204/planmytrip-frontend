import { PERSONA_LIST } from "../../theme/personas";

export default function TripTypeSelector({ value, onChange }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {PERSONA_LIST.map((type) => {
        const Icon = type.icon;
        const active = value === type.key;
        return (
          <button
            key={type.key}
            type="button"
            onClick={() => onChange(type.key)}
            className={`focus-ring flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition ${
              active ? "text-slate-900" : "border-slate-200 text-slate-500 hover:border-slate-300"
            }`}
            style={active ? { borderColor: "var(--brand)", borderWidth: 2, backgroundColor: "var(--brand-light)" } : undefined}
          >
            <Icon className="h-4 w-4" />
            {type.label}
          </button>
        );
      })}
    </div>
  );
}
