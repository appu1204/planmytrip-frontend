import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Plus } from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import Button from "../../components/ui/Button";
import CategoryFilter from "../../components/wishlist/CategoryFilter";
import WishlistCard from "../../components/wishlist/WishlistCard";
import { useAuth } from "../../context/AuthContext";
import { getPersona } from "../../theme/personas";
import { listWishlist, removeWishlistItem } from "../../api/wishlist";
import { FALLBACK_WISHLIST, WISHLIST_CATEGORIES } from "../../theme/wishlistFallback";

export default function Wishlist() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const persona = getPersona(user?.persona);

  const [items, setItems] = useState(FALLBACK_WISHLIST);
  const [category, setCategory] = useState("All");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    listWishlist()
      .then((data) => {
        if (!cancelled && Array.isArray(data) && data.length) setItems(data);
      })
      .catch(() => {
        // Keep bundled sample destinations — the page should never look empty.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const onRemove = async (id) => {
    setItems((prev) => prev.filter((i) => i.id !== id)); // optimistic — feels instant
    try {
      await removeWishlistItem(id);
    } catch (err) {
      setError(err.message);
    }
  };

  const onPlan = (item) => {
    // Reuses CreateTrip's location.state pre-fill pattern (see SearchBar).
    navigate("/trips/new", { state: { destination: `${item.name}, ${item.country}` } });
  };

  const filtered = category === "All" ? items : items.filter((i) => i.category === category);

  return (
    <div className="min-h-screen bg-[#f6f5f1]">
      <Navbar user={user} />

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-semibold text-slate-900">My wishlist</h1>
            <p className="mt-1 text-sm text-slate-500">
              {items.length} saved destinations · {persona.label} circle
            </p>
          </div>
          <Button className="w-auto px-5" onClick={() => navigate("/trips/new")}>
            <Plus className="h-4 w-4" /> Plan a trip to any destination
          </Button>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</div>
        )}

        <div className="mb-6">
          <CategoryFilter categories={WISHLIST_CATEGORIES} active={category} onChange={setCategory} />
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center">
            <p className="text-slate-500">Nothing saved in this category yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {filtered.map((item, i) => (
              <WishlistCard key={item.id} item={item} index={i} onRemove={onRemove} onPlan={onPlan} />
            ))}
          </div>
        )}

        <div
          className="mt-10 flex flex-col items-start justify-between gap-4 rounded-2xl p-6 text-white sm:flex-row sm:items-center"
          style={{ backgroundImage: "linear-gradient(160deg, var(--brand-dark), var(--brand))" }}
        >
          <div>
            <h3 className="font-display text-lg font-semibold">Not sure where to go next?</h3>
            <p className="mt-1 text-sm text-white/75">
              Let PlanMyTrip's AI suggest destinations based on your wishlist and past trips.
            </p>
          </div>
          <button
            onClick={() => navigate("/planner")}
            className="focus-ring flex shrink-0 items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white"
            style={{ backgroundColor: "var(--accent)" }}
          >
            <Sparkles className="h-4 w-4" /> Get AI suggestions
          </button>
        </div>
      </main>
    </div>
  );
}
