import { Sparkles } from "lucide-react";

export default function AISuggestionPanel({ dayLabel, suggestion, onAdd }) {
  return (
    <div
      className="rounded-2xl p-5 text-white"
      style={{ backgroundImage: "linear-gradient(160deg, var(--brand-dark), var(--brand))" }}
    >
      <div className="flex items-center gap-2 text-sm font-semibold">
        <Sparkles className="h-4 w-4" /> AI suggestion for {dayLabel}
      </div>
      <p className="mt-3 text-sm leading-relaxed text-white/85">{suggestion.text}</p>
      <button
        onClick={onAdd} // appends the suggested stop to the active day's timeline
        className="focus-ring mt-4 w-full rounded-xl py-2.5 text-sm font-semibold text-white"
        style={{ backgroundColor: "var(--accent)" }}
      >
        Add to itinerary
      </button>
    </div>
  );
}
