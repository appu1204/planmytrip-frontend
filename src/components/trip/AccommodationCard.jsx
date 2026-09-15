import { Star, CheckCircle2 } from "lucide-react";

export default function AccommodationCard({ stay }) {
  if (!stay) return null;
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-card">
      <div
        className="h-24 w-full"
        style={{ backgroundImage: "linear-gradient(135deg, var(--brand-mid), var(--brand-dark))" }}
      />
      <div className="p-5">
        <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
          <CheckCircle2 className="h-3.5 w-3.5" /> Confirmed
        </div>
        <h4 className="font-display text-base font-semibold text-slate-900">{stay.name}</h4>
        <div className="mt-1 flex items-center gap-1 text-xs text-slate-500">
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> {stay.rating} · {stay.reviews} reviews
        </div>
        <p className="mt-2 text-xs text-slate-500">{stay.roomType}</p>
      </div>
    </div>
  );
}
