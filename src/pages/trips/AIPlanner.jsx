import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Sparkles, Star } from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Counter from "../../components/trip/Counter";
import PreferenceChip from "../../components/planner/PreferenceChip";
import PlanDayPreview from "../../components/planner/PlanDayPreview";
import { useAuth } from "../../context/AuthContext";
import { getPersona } from "../../theme/personas";
import { generateStandaloneItinerary, saveItinerary } from "../../api/itinerary";
import { createTrip } from "../../api/trips";
import { buildFallbackItinerary } from "../../utils/itineraryFallback";

const PREFERENCE_OPTIONS = [
  "Backwaters",
  "Beaches",
  "Wildlife",
  "Theme parks",
  "Museums",
  "Local food",
  "Trekking",
  "Nightlife",
];

export default function AIPlanner() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { state } = useLocation();
  const persona = getPersona(user?.persona);

  const [form, setForm] = useState({
    destination: state?.destination || "",
    checkIn: "",
    checkOut: "",
    budget: 120000,
    adults: 2,
    children: 0,
  });
  const [preferences, setPreferences] = useState(["Backwaters", "Beaches"]);
  const [plan, setPlan] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (field) => (value) => setForm((f) => ({ ...f, [field]: value }));

  const togglePreference = (label) =>
    setPreferences((prev) => (prev.includes(label) ? prev.filter((p) => p !== label) : [...prev, label]));

  const travellersLabel = `Family of ${form.adults + form.children} · ${form.adults} adults, ${form.children} children`;

  const dayTag = (index, total) => {
    if (index === 1) return "Easy pace";
    if (index === total) return "Wind down";
    return preferences[0] ? `${preferences[0]} favourite` : "Recommended";
  };

  const generate = async () => {
    setError("");
    setGenerating(true);
    try {
      const result = await generateStandaloneItinerary({
        destination: form.destination,
        checkIn: form.checkIn,
        checkOut: form.checkOut,
        budget: form.budget,
        adults: form.adults,
        children: form.children,
        preferences,
        persona: persona.key,
      });
      setPlan(result);
    } catch {
      // No live AI service yet — show a generated-from-dates plan so the
      // screen still demonstrates the full flow end to end.
      setPlan(buildFallbackItinerary(form));
    } finally {
      setGenerating(false);
    }
  };

  const saveToTrip = async () => {
    if (!plan) return;
    setSaving(true);
    setError("");
    try {
      const trip = await createTrip({
        userId: user?.id,
        name: `${form.destination || "New"} Trip`,
        destination: form.destination,
        tripType: persona.key,
        checkIn: form.checkIn,
        checkOut: form.checkOut,
        adults: form.adults,
        children: form.children,
        status: "PLANNED",
      });
      const tripId = trip?.id ?? trip?.tripId;
      if (tripId) await saveItinerary(tripId, plan).catch(() => {});
      navigate(tripId ? `/trips/${tripId}` : "/trips");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f5f1]">
      <Navbar user={user} />

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8 text-center">
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold"
            style={{ backgroundColor: "var(--accent-light)", color: "var(--accent-dark)" }}
          >
            <Sparkles className="h-3.5 w-3.5" /> AI Trip Planner
          </span>
          <h1 className="mt-3 font-display text-3xl font-semibold text-slate-900">Plan with AI</h1>
          <p className="mt-1 text-sm text-slate-500">
            Tell us your {persona.label.toLowerCase()} trip preferences — get a complete, editable itinerary in
            seconds.
          </p>
        </div>

        {error && (
          <div className="mx-auto mb-6 max-w-2xl rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[380px_1fr]">
          <section className="space-y-5 rounded-2xl border border-slate-100 bg-white p-6 shadow-card">
            <h2 className="font-display text-lg font-semibold text-slate-900">Trip basics</h2>
            <Input
              label="Destination"
              placeholder="City, Country"
              value={form.destination}
              onChange={(e) => set("destination")(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Check-in" type="date" value={form.checkIn} onChange={(e) => set("checkIn")(e.target.value)} />
              <Input label="Check-out" type="date" value={form.checkOut} onChange={(e) => set("checkOut")(e.target.value)} />
            </div>
            <div>
              <span className="mb-2 block text-sm font-medium text-slate-800">Budget (total)</span>
              <input
                type="range"
                min={20000}
                max={300000}
                step={5000}
                value={form.budget}
                onChange={(e) => set("budget")(Number(e.target.value))}
                className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-[var(--brand)]"
              />
              <div className="mt-1 text-right text-sm font-semibold text-slate-800">
                ₹{form.budget.toLocaleString("en-IN")}
              </div>
            </div>
            <Counter label="Adults" sublabel="18+ years" value={form.adults} onChange={set("adults")} min={1} />
            <Counter label="Children" sublabel="2–17 years" value={form.children} onChange={set("children")} />
            <p className="text-xs text-slate-400">{travellersLabel}</p>

            <div>
              <span className="mb-2 block text-sm font-medium text-slate-800">What does your trip need?</span>
              <div className="flex flex-wrap gap-2">
                {PREFERENCE_OPTIONS.map((p) => (
                  <PreferenceChip key={p} label={p} active={preferences.includes(p)} onToggle={togglePreference} />
                ))}
              </div>
            </div>

            <Button onClick={generate} loading={generating}>
              <Sparkles className="h-4 w-4" /> Generate my itinerary
            </Button>
          </section>

          <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-card">
            {!plan ? (
              <div className="flex h-full min-h-[320px] flex-col items-center justify-center text-center">
                <Sparkles className="h-8 w-8" style={{ color: "var(--brand)" }} />
                <p className="mt-3 max-w-xs text-sm text-slate-500">
                  Fill in the basics and generate your plan — it'll appear here, ready to save or tweak.
                </p>
              </div>
            ) : (
              <>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="font-display text-lg font-semibold text-slate-900">
                    {plan.days.length}-day {form.destination || "trip"} plan
                  </h2>
                  <span className="flex items-center gap-1 text-xs font-semibold text-amber-500">
                    <Star className="h-3.5 w-3.5 fill-amber-400" />
                    <Star className="h-3.5 w-3.5 fill-amber-400" />
                    <Star className="h-3.5 w-3.5 fill-amber-400" />
                    <Star className="h-3.5 w-3.5 fill-amber-400" />
                    <Star className="h-3.5 w-3.5 fill-amber-400" />
                  </span>
                </div>
                <div className="space-y-3">
                  {plan.days.map((day) => (
                    <PlanDayPreview key={day.id} day={day} tag={dayTag(day.index, plan.days.length)} />
                  ))}
                </div>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <Button variant="secondary" className="sm:w-40" onClick={generate} loading={generating}>
                    Regenerate
                  </Button>
                  <Button loading={saving} onClick={saveToTrip}>
                    Save to my trip →
                  </Button>
                </div>
              </>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
