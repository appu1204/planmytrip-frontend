import { Sparkles } from "lucide-react";
import { getPersona } from "../../theme/personas";

const TIP_COPY = {
  solo: "Solo trips work best with a flexible pace — leave at least one day unplanned for wherever the trip takes you.",
  couple: "Book anything time-sensitive (sunset cruises, tasting menus) early — the good slots fill up first.",
  friends: "Lock in one big shared activity per day and leave the rest loose so the group doesn't burn out.",
  family: "Keep travel days short and build in nap-friendly windows — a lighter pace usually means a better trip.",
};

export default function TripTipCard({ personaKey, nights }) {
  const persona = getPersona(personaKey);
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-card">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold" style={{ color: "var(--brand)" }}>
        <Sparkles className="h-4 w-4" />
        {persona.label} trip tip
      </div>
      <p className="text-sm leading-relaxed text-slate-600">{TIP_COPY[personaKey] || TIP_COPY.family}</p>
      {nights > 0 && (
        <div className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-center">
          <div className="font-display text-lg font-semibold text-slate-900">{nights}</div>
          <div className="text-xs text-slate-500">nights planned</div>
        </div>
      )}
    </div>
  );
}
