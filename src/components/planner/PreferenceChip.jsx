export default function PreferenceChip({ label, active, onToggle }) {
  return (
    <button
      type="button"
      onClick={() => onToggle(label)} // adds/removes this preference from the AI generation request
      className={`focus-ring rounded-full border px-4 py-1.5 text-sm font-semibold transition ${
        active ? "text-white" : "border-slate-200 text-slate-500 hover:border-slate-300"
      }`}
      style={active ? { backgroundColor: "var(--brand)", borderColor: "var(--brand)" } : undefined}
    >
      {label}
    </button>
  );
}
