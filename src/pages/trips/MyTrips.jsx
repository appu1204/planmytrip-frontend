import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Plus, MapPin, Users, Trash2, CheckCircle2, XCircle } from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import Button from "../../components/ui/Button";
import StatusBadge from "../../components/trip/StatusBadge";
import { useAuth } from "../../context/AuthContext";
import { listTrips, patchTripStatus, deleteTrip } from "../../api/trips";
import { formatDateLabel } from "../../utils/format";

export default function MyTrips() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { state } = useLocation();

  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [banner, setBanner] = useState(state?.justCreated ? `"${state.justCreated}" was created.` : "");

  useEffect(() => {
    let cancelled = false;
    listTrips({ userId: user?.id, page: 0, size: 20 })
      .then((data) => {
        if (cancelled) return;
        const rows = Array.isArray(data) ? data : data?.content || [];
        setTrips(rows);
        setError("");
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user?.id]);


  const updateLocal = (tripId, patch) => {
    setTrips((prev) => prev.map((t) => ((t.id ?? t.tripId) === tripId ? { ...t, ...patch } : t)));
  };

  const onMarkCompleted = async (tripId) => {
    setBusyId(tripId);
    try {
      await patchTripStatus(tripId, "COMPLETED");
      updateLocal(tripId, { status: "COMPLETED" });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const onCancel = async (tripId) => {
    setBusyId(tripId);
    try {
      await patchTripStatus(tripId, "CANCELLED");
      updateLocal(tripId, { status: "CANCELLED" });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const onDelete = async (tripId, name) => {
    if (!window.confirm(`Delete "${name}"? This can't be undone.`)) return;
    setBusyId(tripId);
    try {
      await deleteTrip(tripId);
      setTrips((prev) => prev.filter((t) => (t.id ?? t.tripId) !== tripId));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f5f1]">
      <Navbar user={user} />

      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="font-display text-3xl font-semibold text-slate-900">My trips</h1>
            <p className="mt-1 text-sm text-slate-500">Everything you're planning, in one place.</p>
          </div>
          <Button className="w-auto px-5" onClick={() => navigate("/trips/new")}>
            <Plus className="h-4 w-4" /> New trip
          </Button>
        </div>

        {banner && (
          <div className="mb-6 flex items-center justify-between rounded-lg bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700">
            {banner}
            <button onClick={() => setBanner("")} className="font-semibold">
              Dismiss
            </button>
          </div>
        )}
        {error && (
          <div className="mb-6 rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</div>
        )}

        {loading ? (
          <div className="py-20 text-center text-sm text-slate-400">Loading your trips…</div>
        ) : trips.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center">
            <p className="text-slate-500">No trips yet — start planning your first one.</p>
            <Button className="mx-auto mt-5 w-auto px-6" onClick={() => navigate("/trips/new")}>
              Create a trip
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {trips.map((trip) => {
              const tripId = trip.id ?? trip.tripId;
              const tripName = trip.name || trip.tripName || `${trip.destination || "My"} Trip`;
              const checkIn = trip.checkIn || trip.startDate;
              const checkOut = trip.checkOut || trip.endDate;
              const travellers = (trip.adults || 0) + (trip.children || 0);
              return (
                <div
                  key={tripId}
                  className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-card sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2.5">
                      <Link
                        to={`/trips/${tripId}`} // opens the itinerary builder for this trip
                        className="font-display text-lg font-semibold text-slate-900 hover:underline"
                      >
                        {tripName}
                      </Link>
                      <StatusBadge status={trip.status} />
                    </div>
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" /> {trip.destination}
                      </span>
                      {checkIn && checkOut && (
                        <span>
                          {formatDateLabel(checkIn)} – {formatDateLabel(checkOut)}
                        </span>
                      )}
                      {travellers > 0 && (
                        <span className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" /> {travellers} travellers
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigate(`/trips/${tripId}`)} // itinerary builder + map + budget tabs
                      className="focus-ring flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-white"
                      style={{ backgroundColor: "var(--brand)" }}
                    >
                      Open itinerary
                    </button>
                    {trip.status !== "COMPLETED" && trip.status !== "CANCELLED" && (
                      <>
                        <button
                          disabled={busyId === tripId}
                          onClick={() => onMarkCompleted(tripId)}
                          className="focus-ring flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" /> Complete
                        </button>
                        <button
                          disabled={busyId === tripId}
                          onClick={() => onCancel(tripId)}
                          className="focus-ring flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                        >
                          <XCircle className="h-3.5 w-3.5" /> Cancel
                        </button>
                      </>
                    )}
                    <button
                      disabled={busyId === tripId}
                      onClick={() => onDelete(tripId, trip.name)}
                      className="focus-ring grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-400 transition hover:border-red-200 hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
                      aria-label="Delete trip"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
