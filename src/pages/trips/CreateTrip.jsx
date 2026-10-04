import { useMemo, useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import {
  ChevronRight,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
} from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Counter from "../../components/trip/Counter";
import TripTypeSelector from "../../components/trip/TripTypeSelector";
import CostEstimateCard from "../../components/trip/CostEstimateCard";
import TripTipCard from "../../components/trip/TripTipCard";
import DestinationPreviewCard from "../../components/trip/DestinationPreviewCard";
import WeatherAdvisoryModal from "../../components/trip/WeatherAdvisoryModal";
import { useAuth } from "../../context/AuthContext";
import { createTrip, putTripPreferences } from "../../api/trips";
import { estimateTripCost } from "../../utils/costEstimate";
import { nightsBetween } from "../../utils/format";
import {
  fetchDestinationWeather,
  evaluateWeatherSafety,
  isTripWithinSafetyWindow,
} from "../../utils/weatherAdvisor";

const BUDGET_MIN = 20000;
const BUDGET_MAX = 300000;

export default function CreateTrip() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { state } = useLocation();

  const [form, setForm] = useState({
    tripName: "",
    destination: (state?.destination || "").replace(/[\r\n]+/g, ", ").trim(),
    tripType: user?.persona || "family",
    checkIn: state?.checkIn || "",
    checkOut: state?.checkOut || "",
    adults: 2,
    children: 0,
    budget: 120000,
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(null); // null | "draft" | "create"

  // Weather & Environmental Safety Advisory State
  const [advisory, setAdvisory] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [showAdvisoryModal, setShowAdvisoryModal] = useState(false);

  const set = (field) => (value) => {
    let sanitized = value;
    if (field === "destination" && typeof value === "string") {
      sanitized = value.replace(/[\r\n]+/g, ", ");
    }
    setForm((f) => ({ ...f, [field]: sanitized }));
    setErrors((er) => ({ ...er, [field]: undefined }));
  };

  const nights = nightsBetween(form.checkIn, form.checkOut);
  const estimate = useMemo(
    () => estimateTripCost({ nights, adults: form.adults, children: form.children }),
    [nights, form.adults, form.children]
  );

  const isImmediate = isTripWithinSafetyWindow(form.checkIn);

  // Debounced live weather check when destination or checkIn changes
  useEffect(() => {
    if (!form.destination || form.destination.trim().length < 2) {
      const resetTimer = setTimeout(() => setAdvisory(null), 0);
      return () => clearTimeout(resetTimer);
    }

    const timer = setTimeout(() => {
      setWeatherLoading(true);
      fetchDestinationWeather(form.destination)
        .then((data) => {
          const evalRes = evaluateWeatherSafety(data, { startDate: form.checkIn });
          setAdvisory(evalRes);
        })
        .catch(() => {
          setAdvisory(null);
        })
        .finally(() => {
          setWeatherLoading(false);
        });
    }, 500);

    return () => clearTimeout(timer);
  }, [form.destination, form.checkIn]);


  const validate = () => {
    const next = {};
    if (!form.tripName.trim()) next.tripName = "Give your trip a name";
    if (!form.destination.trim()) next.destination = "Enter a destination";
    if (!form.checkIn) next.checkIn = "Pick a check-in date";
    if (!form.checkOut) next.checkOut = "Pick a check-out date";
    if (form.checkIn && form.checkOut && new Date(form.checkOut) <= new Date(form.checkIn)) {
      next.checkOut = "Check-out must be after check-in";
    }
    if (form.adults < 1) next.adults = "At least one adult is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (status) => {
    setApiError("");
    if (!validate()) return;
    setLoading(status);
    try {
      const trip = await createTrip({
        userId: user?.id,
        name: form.tripName,
        destination: form.destination,
        tripType: form.tripType,
        checkIn: form.checkIn,
        checkOut: form.checkOut,
        adults: form.adults,
        children: form.children,
        budget: form.budget,
        currency: "INR",
        status: status === "draft" ? "DRAFT" : "PLANNED",
      });

      const tripId = trip?.id ?? trip?.tripId ?? trip?.data?.id ?? trip?.data?.tripId;
      if (tripId) {
        await putTripPreferences(tripId, {
          budget: form.budget,
          currency: "INR",
          estimatedCost: estimate.total,
        }).catch((err) => {
          console.warn("Optional trip preferences sync warning:", err);
        });
      }

      if (status === "draft") {
        navigate("/trips", { state: { justCreated: form.tripName } });
      } else if (tripId) {
        navigate(`/trips/${tripId}`, { state: { justCreated: form.tripName } });
      } else {
        navigate("/trips", { state: { justCreated: form.tripName } });
      }
    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f5f1]">
      <Navbar user={user} />

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-2 flex items-center gap-1.5 text-sm text-slate-400">
          <Link to="/home" className="hover:text-slate-600">
            Home
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link to="/trips" className="hover:text-slate-600">
            My trips
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="font-medium" style={{ color: "var(--brand)" }}>
            Create a new trip
          </span>
        </div>

        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="font-display text-3xl font-semibold text-slate-900">
              Create a new trip
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Set up the basics — you'll fine-tune the day-by-day plan next.
            </p>
          </div>
          <span
            className="hidden items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold sm:flex"
            style={{ backgroundColor: "var(--brand-light)", color: "var(--brand-dark)" }}
          >
            <Sparkles className="h-3.5 w-3.5" /> AI trip assist active
          </span>
        </div>

        {apiError && (
          <div className="mb-6 rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">
            {apiError}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
          {/* Left: form */}
          <div className="space-y-6">
            <section className="rounded-2xl border border-slate-100 bg-white p-7 shadow-card">
              <SectionHeading index={1} title="Trip details" />
              <div className="mt-5 space-y-5">
                <Input
                  label="Trip name"
                  placeholder="e.g. Kerala Family Getaway 2026"
                  value={form.tripName}
                  onChange={(e) => set("tripName")(e.target.value)}
                  error={errors.tripName}
                />
                <Input
                  label="Destination"
                  placeholder="City, Country"
                  value={form.destination}
                  onChange={(e) => set("destination")(e.target.value)}
                  error={errors.destination}
                />
                <div>
                  <span className="mb-2 block text-sm font-medium text-slate-800">Trip type</span>
                  <TripTypeSelector value={form.tripType} onChange={set("tripType")} />
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-100 bg-white p-7 shadow-card">
              <SectionHeading index={2} title="Dates & travellers" />
              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  label="Check-in"
                  type="date"
                  value={form.checkIn}
                  onChange={(e) => set("checkIn")(e.target.value)}
                  error={errors.checkIn}
                />
                <Input
                  label="Check-out"
                  type="date"
                  value={form.checkOut}
                  onChange={(e) => set("checkOut")(e.target.value)}
                  error={errors.checkOut}
                />
              </div>

              {/* Immediate Tour Real-Time Environmental Status Banner */}
              {advisory && (
                <div
                  className={`mt-4 rounded-xl p-3.5 border transition ${
                    advisory.status === "DANGER"
                      ? "bg-red-50/80 border-red-200 text-red-950"
                      : advisory.status === "CAUTION"
                      ? "bg-amber-50/80 border-amber-200 text-amber-950"
                      : "bg-emerald-50/80 border-emerald-200 text-emerald-950"
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {advisory.status === "DANGER" ? (
                        <AlertOctagon className="h-4 w-4 text-red-600 flex-shrink-0" />
                      ) : advisory.status === "CAUTION" ? (
                        <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0" />
                      ) : (
                        <ShieldCheck className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                      )}
                      <span className="text-xs font-bold">
                        {isImmediate ? "⚡ Immediate Tour Environmental Check:" : "🛡️ Weather Clearance:"}{" "}
                        {advisory.title}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowAdvisoryModal(true)}
                      className="text-xs font-bold underline hover:opacity-80 transition"
                    >
                      View Report ↗
                    </button>
                  </div>
                  <p className="mt-1 text-[11px] leading-relaxed text-slate-600 font-medium">
                    {advisory.professionalVerdict}
                  </p>
                </div>
              )}

              <div className="mt-5 space-y-3">
                <Counter
                  label="Adults"
                  sublabel="18+ years"
                  value={form.adults}
                  onChange={set("adults")}
                  min={1}
                />
                <Counter
                  label="Children"
                  sublabel="2–17 years"
                  value={form.children}
                  onChange={set("children")}
                />
              </div>
              {errors.adults && (
                <p className="mt-2 text-xs font-medium text-red-500">{errors.adults}</p>
              )}
            </section>

            <section className="rounded-2xl border border-slate-100 bg-white p-7 shadow-card">
              <SectionHeading index={3} title="Budget" />
              <div className="mt-6">
                <input
                  type="range"
                  min={BUDGET_MIN}
                  max={BUDGET_MAX}
                  step={5000}
                  value={form.budget}
                  onChange={(e) => set("budget")(Number(e.target.value))}
                  className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-[var(--brand)]"
                />
                <div className="mt-2 flex justify-between text-xs text-slate-400">
                  <span>₹{BUDGET_MIN.toLocaleString("en-IN")}</span>
                  <span className="font-display text-base font-semibold text-slate-800">
                    ₹{form.budget.toLocaleString("en-IN")}
                  </span>
                  <span>₹{BUDGET_MAX.toLocaleString("en-IN")}+</span>
                </div>
              </div>
            </section>

            <div className="flex flex-col-reverse gap-3 sm:flex-row">
              <Button
                type="button"
                variant="secondary"
                className="sm:w-48"
                loading={loading === "draft"}
                onClick={() => submit("draft")}
              >
                Save as draft
              </Button>
              <Button
                type="button"
                loading={loading === "create"}
                onClick={() => submit("create")}
              >
                Create trip & build itinerary →
              </Button>
            </div>
          </div>

          {/* Right: sidebar */}
          <div className="space-y-6">
            <TripTipCard personaKey={form.tripType} nights={nights} />
            <DestinationPreviewCard destination={form.destination} />
            <CostEstimateCard estimate={estimate} />
          </div>
        </div>
      </main>

      {/* Weather Safety Advisory Modal */}
      <WeatherAdvisoryModal
        isOpen={showAdvisoryModal}
        onClose={() => setShowAdvisoryModal(false)}
        advisory={advisory}
        loading={weatherLoading}
        isImmediate={isImmediate}
        onRefresh={() => {
          if (form.destination) {
            setWeatherLoading(true);
            fetchDestinationWeather(form.destination)
              .then((data) => setAdvisory(evaluateWeatherSafety(data, { startDate: form.checkIn })))
              .finally(() => setWeatherLoading(false));
          }
        }}
      />
    </div>
  );
}

function SectionHeading({ index, title }) {
  return (
    <div className="flex items-center gap-3">
      <span
        className="grid h-6 w-6 place-items-center rounded-full text-xs font-bold"
        style={{ backgroundColor: "var(--brand-light)", color: "var(--brand)" }}
      >
        {index}
      </span>
      <h2 className="font-display text-lg font-semibold text-slate-900">{title}</h2>
    </div>
  );
}
