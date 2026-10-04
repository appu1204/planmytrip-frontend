import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, MapPin, Star, ArrowUpRight, Sparkles, Calendar, Eye, X, Check } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { addWishlistItem, removeWishlistItem } from "../../api/wishlist";

const GRADIENTS = [
  "linear-gradient(135deg, #1e3a8a, #0f172a)",
  "linear-gradient(135deg, #064e3b, #022c22)",
  "linear-gradient(135deg, #0c4a6e, #082f49)",
  "linear-gradient(135deg, #701a75, #3b0764)",
  "linear-gradient(135deg, #831843, #500724)",
];

export default function DestinationCard({ destination, index = 0, onOpenAuth }) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [showQuickView, setShowQuickView] = useState(false);

  const imageUrl = !imgError ? (destination.image || destination.imageUrl) : null;

  const handleStartTrip = (e) => {
    if (e) e.stopPropagation();
    navigate("/trips/new", {
      state: {
        destination: `${destination.name}, ${destination.country}`,
        suggestedBudget: destination.priceFrom ? destination.priceFrom.replace(/[^0-9]/g, "") : "",
      },
    });
  };

  const handlePlanWithAI = (e) => {
    if (e) e.stopPropagation();
    navigate(`/planner?destination=${encodeURIComponent(`${destination.name}, ${destination.country}`)}`);
  };

  const handleWishlistToggle = async (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      if (onOpenAuth) onOpenAuth("login");
      return;
    }
    const nextSaved = !saved;
    setSaved(nextSaved);
    setSaving(true);
    try {
      if (nextSaved) {
        await addWishlistItem({
          destinationId: destination.id,
          name: destination.name,
          country: destination.country,
          image: destination.image || destination.imageUrl,
          category: destination.tag || "Curated",
        });
      } else {
        await removeWishlistItem(destination.id);
      }
    } catch (err) {
      console.warn("Wishlist sync warning:", err);
      setSaved(!nextSaved);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={handleStartTrip}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleStartTrip(e)}
        className="group relative h-80 w-64 shrink-0 cursor-pointer overflow-hidden rounded-3xl bg-slate-900 shadow-panel transition-all duration-300 hover:-translate-y-2 hover:shadow-card-hover sm:h-96 sm:w-72"
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={destination.name}
            loading="lazy"
            onError={() => setImgError(true)}
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          />
        ) : (
          <div
            className="h-full w-full transition-transform duration-700 group-hover:scale-110"
            style={{ backgroundImage: GRADIENTS[index % GRADIENTS.length] }}
          />
        )}

        {/* Cinematic Multi-Stop Scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-950/20" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent" />

        {/* Top Badges & Actions */}
        <div className="absolute inset-x-3.5 top-3.5 flex items-center justify-between z-10">
          <div className="flex items-center gap-1.5">
            {destination.rating && (
              <span className="flex items-center gap-1 rounded-full bg-black/40 px-2.5 py-1 text-xs font-bold text-white backdrop-blur-md border border-white/10 shadow-sm">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                {destination.rating}
                {destination.reviews && (
                  <span className="text-[10px] font-normal text-white/70">({destination.reviews})</span>
                )}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowQuickView(true);
              }}
              title="Quick preview"
              className="grid h-8 w-8 place-items-center rounded-full bg-black/40 text-white/90 backdrop-blur-md border border-white/10 transition hover:scale-110 hover:bg-black/60 hover:text-white"
            >
              <Eye className="h-3.5 w-3.5" />
            </button>

            <button
              type="button"
              onClick={handleWishlistToggle}
              disabled={saving}
              aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
              className="grid h-8 w-8 place-items-center rounded-full bg-black/40 text-white backdrop-blur-md border border-white/10 transition hover:scale-110 hover:bg-black/60"
            >
              <Heart
                className={`h-4 w-4 transition-transform duration-200 ${
                  saved ? "fill-rose-500 text-rose-500 scale-110" : "text-white"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Bottom Details Section */}
        <div className="absolute inset-x-0 bottom-0 p-5 z-10">
          {destination.tag && (
            <div className="mb-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-300 backdrop-blur-md border border-white/10">
                <Sparkles className="h-2.5 w-2.5" />
                {destination.tag}
              </span>
            </div>
          )}

          <div className="flex items-end justify-between gap-2">
            <div>
              <h3 className="font-display text-xl font-bold text-white leading-tight drop-shadow-sm sm:text-2xl">
                {destination.name}
              </h3>
              <div className="mt-1 flex items-center gap-1.5 text-xs text-white/80 font-medium">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                <span>{destination.country}</span>
                {destination.duration && (
                  <>
                    <span className="text-white/40">·</span>
                    <span className="text-white/70">{destination.duration}</span>
                  </>
                )}
              </div>
            </div>

            {destination.priceFrom && (
              <div className="text-right shrink-0">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-white/70">From</div>
                <div className="text-sm font-extrabold text-amber-300 sm:text-base">{destination.priceFrom}</div>
              </div>
            )}
          </div>

          {/* Quick Action on Card Hover */}
          <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
            <span className="text-[11px] font-semibold text-emerald-300 group-hover:underline flex items-center gap-1">
              Plan custom trip <ArrowUpRight className="h-3.5 w-3.5" />
            </span>
            <span className="text-[10px] text-white/60 font-mono">
              {destination.bestSeason || "Top season"}
            </span>
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      {showQuickView && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in"
          onClick={() => setShowQuickView(false)}
        >
          <div
            className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Image Header */}
            <div className="relative h-60 w-full sm:h-72">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={destination.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div
                  className="h-full w-full"
                  style={{ backgroundImage: GRADIENTS[index % GRADIENTS.length] }}
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />

              <button
                type="button"
                onClick={() => setShowQuickView(false)}
                className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-black/50 text-white backdrop-blur-md hover:bg-black/70"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="absolute bottom-4 left-5 right-5 text-white">
                <span className="inline-block rounded-full bg-emerald-500/80 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-md">
                  {destination.tag || "Curated Destination"}
                </span>
                <h2 className="mt-1 font-display text-2xl font-bold sm:text-3xl">
                  {destination.name}, {destination.country}
                </h2>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div className="grid grid-cols-3 gap-3 rounded-2xl bg-slate-50 p-3.5 border border-slate-100 text-center">
                <div>
                  <div className="text-[10px] font-bold uppercase text-slate-400">Rating</div>
                  <div className="mt-0.5 flex items-center justify-center gap-1 font-display text-sm font-bold text-slate-900">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    {destination.rating || 4.9}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase text-slate-400">Best Season</div>
                  <div className="mt-0.5 flex items-center justify-center gap-1 text-xs font-bold text-slate-900">
                    <Calendar className="h-3.5 w-3.5 text-emerald-600" />
                    {destination.bestSeason || "Year-Round"}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase text-slate-400">Est. Budget</div>
                  <div className="mt-0.5 text-xs font-bold text-emerald-700">
                    {destination.priceFrom || "₹22,000"}
                  </div>
                </div>
              </div>

              {destination.highlights && destination.highlights.length > 0 && (
                <div className="mt-5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Curated Highlights
                  </h4>
                  <div className="mt-2.5 space-y-2">
                    {destination.highlights.map((hl) => (
                      <div key={hl} className="flex items-center gap-2 text-xs font-medium text-slate-700">
                        <span className="grid h-4 w-4 place-items-center rounded-full bg-emerald-100 text-emerald-800">
                          <Check className="h-2.5 w-2.5" />
                        </span>
                        {hl}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
                <button
                  type="button"
                  onClick={handlePlanWithAI}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 px-4 py-3 text-xs font-bold text-white shadow-md hover:from-emerald-500 hover:to-teal-600 transition"
                >
                  <Sparkles className="h-4 w-4 text-amber-300" /> Plan with AI Itinerary
                </button>
                <button
                  type="button"
                  onClick={handleStartTrip}
                  className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold text-slate-800 hover:bg-slate-50 transition"
                >
                  Create Manual Trip
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


