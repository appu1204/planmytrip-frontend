import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, MapPin, Star, ArrowUpRight } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { addWishlistItem } from "../../api/wishlist";

const GRADIENTS = [
  "linear-gradient(135deg, #1d4ed8, #0f172a)",
  "linear-gradient(135deg, #0f766e, #0a2e1a)",
  "linear-gradient(135deg, #0891b2, #0f2942)",
  "linear-gradient(135deg, #15803d, #052e16)",
  "linear-gradient(135deg, #0d9488, #134e4a)",
];

export default function DestinationCard({ destination, index = 0, onOpenAuth }) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleCardClick = () => {
    navigate("/trips/new", {
      state: {
        destination: `${destination.name}, ${destination.country}`,
      },
    });
  };

  const handleWishlistToggle = async (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      if (onOpenAuth) onOpenAuth("login");
      return;
    }
    setSaved((s) => !s);
    if (!saved) {
      setSaving(true);
      try {
        await addWishlistItem({
          destinationId: destination.id,
          name: destination.name,
          country: destination.country,
          image: destination.image,
          category: destination.tag || "Popular",
        });
      } catch (err) {
        console.warn("Wishlist save error:", err);
      } finally {
        setSaving(false);
      }
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleCardClick()}
      className="group relative h-64 w-60 shrink-0 cursor-pointer overflow-hidden rounded-2xl shadow-card transition-all duration-300 hover:-translate-y-1.5 hover:shadow-card-hover sm:h-72 sm:w-64"
    >
      {destination.image ? (
        <img
          src={destination.image}
          alt={destination.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
        />
      ) : (
        <div
          className="h-full w-full transition-transform duration-500 group-hover:scale-110"
          style={{ backgroundImage: GRADIENTS[index % GRADIENTS.length] }}
        />
      )}

      {/* Luxury multi-stop gradient for readable text and badges */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-slate-950/10" />

      {/* Top badges */}
      <div className="absolute inset-x-3 top-3 flex items-center justify-between">
        {destination.rating ? (
          <span className="flex items-center gap-1 rounded-full bg-slate-950/50 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-md">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            {destination.rating}
          </span>
        ) : (
          <span />
        )}

        <button
          type="button"
          onClick={handleWishlistToggle}
          disabled={saving}
          className="grid h-8 w-8 place-items-center rounded-full bg-slate-950/50 text-white backdrop-blur-md transition hover:scale-110 hover:bg-slate-950/75 focus:outline-none"
          aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
        >
          <Heart
            className={`h-4 w-4 transition-colors ${
              saved ? "fill-rose-500 text-rose-500" : "text-white"
            }`}
          />
        </button>
      </div>

      {/* Bottom Info */}
      <div className="absolute inset-x-0 bottom-0 p-4">
        {destination.tag && (
          <span className="mb-1.5 inline-block text-[11px] font-semibold uppercase tracking-wider text-white/80">
            {destination.tag}
          </span>
        )}
        <div className="flex items-end justify-between">
          <div>
            <h3 className="font-display text-lg font-bold text-white leading-tight">
              {destination.name}
            </h3>
            <div className="mt-1 flex items-center gap-1 text-xs text-white/80">
              <MapPin className="h-3 w-3 shrink-0 text-emerald-400" /> {destination.country}
            </div>
          </div>
          {destination.priceFrom && (
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-wider text-white/70">From</div>
              <div className="text-xs font-bold text-amber-300">{destination.priceFrom}</div>
            </div>
          )}
        </div>

        {/* Hover quick action prompt */}
        <div className="mt-2.5 flex items-center gap-1 text-[11px] font-semibold text-emerald-300 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <span>Plan trip here</span>
          <ArrowUpRight className="h-3.5 w-3.5" />
        </div>
      </div>
    </div>
  );
}

