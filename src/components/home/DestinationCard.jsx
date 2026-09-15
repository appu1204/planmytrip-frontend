import { useState } from "react";
import { Heart, MapPin } from "lucide-react";

const GRADIENTS = [
  "linear-gradient(135deg, #1d4ed8, #0f172a)",
  "linear-gradient(135deg, #0f766e, #0a2e1a)",
  "linear-gradient(135deg, #0891b2, #0f2942)",
  "linear-gradient(135deg, #15803d, #052e16)",
  "linear-gradient(135deg, #0d9488, #134e4a)",
];

export default function DestinationCard({ destination, index = 0 }) {
  const [saved, setSaved] = useState(false);

  return (
    <div className="group relative h-56 w-56 shrink-0 overflow-hidden rounded-2xl shadow-card sm:w-64">
      {destination.image ? (
        <img
          src={destination.image}
          alt={destination.name}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
      ) : (
        <div
          className="h-full w-full transition duration-300 group-hover:scale-105"
          style={{ backgroundImage: GRADIENTS[index % GRADIENTS.length] }}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/10" />

      <button
        onClick={() => setSaved((s) => !s)}
        className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-black/25 text-white backdrop-blur-sm transition hover:bg-black/40"
        aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
      >
        <Heart className={`h-4 w-4 ${saved ? "fill-red-500 text-red-500" : ""}`} />
      </button>

      <div className="absolute inset-x-0 bottom-0 p-4">
        <div className="font-display text-lg font-semibold text-white">{destination.name}</div>
        <div className="mt-1 flex items-center gap-1 text-xs text-white/80">
          <MapPin className="h-3 w-3" /> {destination.country}
        </div>
      </div>
    </div>
  );
}
