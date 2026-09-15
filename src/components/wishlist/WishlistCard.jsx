import { Heart, MapPin } from "lucide-react";
import { formatINR } from "../../utils/format";

const GRADIENTS = [
  "linear-gradient(135deg, #0891b2, #0f2942)",
  "linear-gradient(135deg, #15803d, #052e16)",
  "linear-gradient(135deg, #1d4ed8, #0f172a)",
  "linear-gradient(135deg, #0d9488, #134e4a)",
];

export default function WishlistCard({ item, index, onRemove, onPlan }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-card">
      <div className="relative h-36" style={{ backgroundImage: GRADIENTS[index % GRADIENTS.length] }}>
        <span className="absolute left-3 top-3 rounded-full bg-black/25 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
          {item.category}
        </span>
        <span className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-black/25 text-white backdrop-blur-sm">
          <Heart className="h-4 w-4 fill-red-500 text-red-500" />
        </span>
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-display text-lg font-semibold text-slate-900">{item.name}</h3>
            <div className="mt-1 flex items-center gap-1 text-xs text-slate-500">
              <MapPin className="h-3.5 w-3.5" /> {item.country}
            </div>
          </div>
          <div className="text-right">
            <div className="font-display text-base font-semibold text-slate-900">
              {formatINR(item.perPerson)}
            </div>
            <div className="text-xs text-slate-400">per person</div>
          </div>
        </div>
        <div className="mt-2 text-xs text-slate-400">{item.nights} days</div>
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => onRemove(item.id)} // un-saves this destination
            className="focus-ring flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Remove
          </button>
          <button
            onClick={() => onPlan(item)} // hands the destination to Create Trip pre-filled
            className="focus-ring flex-1 rounded-xl py-2.5 text-sm font-semibold text-white"
            style={{ backgroundColor: "var(--brand)" }}
          >
            Plan trip
          </button>
        </div>
      </div>
    </div>
  );
}
