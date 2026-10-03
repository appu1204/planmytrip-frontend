import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LoaderCircle, RotateCw, Sparkles, Plus } from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import Button from "../../components/ui/Button";
import CategoryFilter from "../../components/wishlist/CategoryFilter";
import WishlistCard from "../../components/wishlist/WishlistCard";
import { useAuth } from "../../context/AuthContext";
import { getPersona } from "../../theme/personas";
import { listWishlist, removeWishlistItem } from "../../api/wishlist";

export default function Wishlist() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const persona = getPersona(user?.persona);

  const [items, setItems] = useState([]);
  const [category, setCategory] = useState("All");
  const [error, setError] = useState("");
  const [errorTitle, setErrorTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadAttempt, setLoadAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    listWishlist()
      .then((data) => {
        const entries = Array.isArray(data)
          ? data
          : [data?.items, data?.content, data?.results].find(Array.isArray);
        if (!entries) throw new Error("The wishlist response was not in the expected format.");
        if (!cancelled) {
          setItems(entries);
          setCategory("All");
          setError("");
          setErrorTitle("");
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setItems([]);
          const unavailable = err.response?.status === 404;
          setErrorTitle(unavailable ? "Wishlist isn’t available yet." : "We couldn’t load your wishlist.");
          setError(
            unavailable
              ? "Saved destinations aren’t available on this server yet. Please try again later."
              : "Check your connection and try again."
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [loadAttempt]);

  const onRemove = async (id) => {
    try {
      await removeWishlistItem(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
      setError("");
    } catch (err) {
      setError(err.message || "Could not remove this destination. Please try again.");
    }
  };

  const onPlan = (item) => {
    // Reuses CreateTrip's location.state pre-fill pattern (see SearchBar).
    navigate("/trips/new", { state: { destination: `${item.name}, ${item.country}` } });
  };

  const categories = ["All", ...new Set(items.map((item) => item.category).filter(Boolean))];
  const filtered = category === "All" ? items : items.filter((item) => item.category === category);

  return (
    <div className="min-h-screen bg-[#f6f5f1]">
      <Navbar user={user} />

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-semibold text-slate-900">My wishlist</h1>
            <p className="mt-1 text-sm text-slate-500">
              {loading
                ? "Loading your saved destinations..."
                : items.length === 0 && error
                  ? "Saved destinations are temporarily unavailable."
                  : `${items.length} saved destinations · ${persona.label} circle`}
            </p>
          </div>
          <Button className="w-auto px-5" onClick={() => navigate("/trips/new")}>
            <Plus className="h-4 w-4" /> Plan a trip to any destination
          </Button>
        </div>

        {error && items.length > 0 && (
          <div role="alert" className="mb-6 rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</div>
        )}

        {!loading && items.length > 0 && (
          <div className="mb-6">
            <CategoryFilter categories={categories} active={category} onChange={setCategory} />
          </div>
        )}

        {loading ? (
          <div role="status" className="flex min-h-52 items-center justify-center gap-3 rounded-2xl bg-white text-sm font-medium text-slate-500">
            <LoaderCircle className="h-4 w-4 animate-spin text-[var(--brand)]" aria-hidden="true" />
            Loading your wishlist...
          </div>
        ) : error && items.length === 0 ? (
          <div role="alert" className="rounded-2xl border border-red-100 bg-white px-6 py-12 text-center">
            <p className="font-semibold text-slate-800">{errorTitle || "We couldn’t load your wishlist."}</p>
            <p className="mt-1 text-sm text-slate-500">{error}</p>
            <button
              type="button"
              onClick={() => {
                setError("");
                setErrorTitle("");
                setLoading(true);
                setLoadAttempt((attempt) => attempt + 1);
              }}
              className="focus-ring mt-4 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white"
              style={{ backgroundColor: "var(--brand)" }}
            >
              <RotateCw className="h-4 w-4" aria-hidden="true" /> Try again
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center">
            <p className="font-semibold text-slate-700">
              {items.length === 0 ? "Your wishlist is empty" : "Nothing saved in this category yet."}
            </p>
            {items.length === 0 && (
              <p className="mt-1 text-sm text-slate-500">Save destinations you love and they’ll appear here.</p>
            )}
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
