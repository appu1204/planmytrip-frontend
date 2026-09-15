import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  MapPin,
  Users,
  RotateCcw,
  Sparkles,
  FileText,
  Upload,
  CloudRain,
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
} from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import Button from "../../components/ui/Button";
import StatusBadge from "../../components/trip/StatusBadge";
import TripTabs from "../../components/trip/TripTabs";
import DayList from "../../components/trip/DayList";
import ActivityTimelineItem from "../../components/trip/ActivityTimelineItem";
import AddActivityForm from "../../components/trip/AddActivityForm";
import AccommodationCard from "../../components/trip/AccommodationCard";
import AISuggestionPanel from "../../components/trip/AISuggestionPanel";
import TripNotesCard from "../../components/trip/TripNotesCard";
import RouteStopList from "../../components/trip/RouteStopList";
import RouteMapCanvas from "../../components/trip/RouteMapCanvas";
import CostEstimateCard from "../../components/trip/CostEstimateCard";
import TripWeatherWidget from "../../components/trip/TripWeatherWidget";
import WeatherAdvisoryModal from "../../components/trip/WeatherAdvisoryModal";
import { useAuth } from "../../context/AuthContext";
import { getTrip } from "../../api/trips";
import {
  getItinerary,
  saveItinerary,
  addItineraryActivity,
  deleteItineraryActivity,
  addItineraryDay,
  updateTripNotes,
  optimizeTripRoute,
  generateItinerary,
} from "../../api/itinerary";
import { buildFallbackItinerary, itineraryToRouteStops } from "../../utils/itineraryFallback";
import {
  fetchDestinationWeather,
  evaluateWeatherSafety,
  isTripWithinSafetyWindow,
} from "../../utils/weatherAdvisor";
import { estimateTripCost } from "../../utils/costEstimate";
import { nightsBetween, formatDateLabel } from "../../utils/format";

const AI_SUGGESTION_TEXT =
  "Add a short buffer after arrival — travel days run smoother with 30 unplanned minutes. We also found a highly rated stop nearby that matches your trip type.";

export default function TripDetail() {
  const { tripId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [tab, setTab] = useState("itinerary");
  const [trip, setTrip] = useState(null);
  const [itinerary, setItinerary] = useState(null);
  const [activeDayId, setActiveDayId] = useState(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [optimizing, setOptimizing] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);

  // Weather & Natural Hazard Advisory State
  const [weatherData, setWeatherData] = useState(null);
  const [weatherAdvisory, setWeatherAdvisory] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [showWeatherModal, setShowWeatherModal] = useState(false);

  // Load the trip record, then its itinerary — falling back to a generated
  // plan from the trip dates if the AI service hasn't returned one yet.
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getTrip(tripId)
      .then((tripData) => {
        if (cancelled) return;
        setTrip(tripData);
        return getItinerary(tripId)
          .then((itin) => {
            const destMatches =
              !itin?.destination ||
              !tripData?.destination ||
              itin.destination.toLowerCase().includes(tripData.destination.toLowerCase()) ||
              tripData.destination.toLowerCase().includes(itin.destination.toLowerCase());

            if (itin && itin.days && itin.days.length > 0 && itin.tripId === tripId && destMatches) {
              return itin;
            }
            return buildFallbackItinerary(tripData);
          })
          .catch(() => buildFallbackItinerary(tripData));
      })
      .then((itineraryData) => {
        if (cancelled || !itineraryData) return;
        setItinerary(itineraryData);
        setActiveDayId(itineraryData.days?.[0]?.id);
      })
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [tripId]);

  // Normalize trip fields returned across different backend models
  const checkIn = trip?.checkIn || trip?.startDate;
  const checkOut = trip?.checkOut || trip?.endDate;
  const tripName = trip?.name || trip?.tripName || `${trip?.destination || "My"} Trip`;
  const nights = nightsBetween(checkIn, checkOut);
  const travellers = (trip?.adults || 0) + (trip?.children || 0);

  // Fetch real-time meteorological data & natural hazard evaluation
  const loadWeather = (destination) => {
    if (!destination) return;
    setWeatherLoading(true);
    fetchDestinationWeather(destination)
      .then((data) => {
        setWeatherData(data);
        const advisory = evaluateWeatherSafety(data, { startDate: checkIn });
        setWeatherAdvisory(advisory);

        // Auto-Popup Trigger:
        // Trigger popup if trip is within 0-4 days (or immediate tour)
        // Check if user has already dismissed it in this browser session
        const withinWindow = isTripWithinSafetyWindow(checkIn);
        const alreadyDismissed = sessionStorage.getItem(`weather_dismissed_${tripId}`);

        if (withinWindow && !alreadyDismissed) {
          setShowWeatherModal(true);
          sessionStorage.setItem(`weather_dismissed_${tripId}`, "true");
        }
      })
      .catch((err) => {
        console.warn("Weather telemetry warning:", err);
      })
      .finally(() => {
        setWeatherLoading(false);
      });
  };

  useEffect(() => {
    if (trip?.destination) {
      loadWeather(trip.destination);
    }
  }, [trip?.destination, checkIn, tripId]);

  // Always provide a reliable itinerary fallback so the UI never displays blank screens
  const effectiveItinerary = useMemo(() => {
    if (itinerary && itinerary.days && itinerary.days.length > 0) return itinerary;
    if (trip) return buildFallbackItinerary(trip);
    return null;
  }, [itinerary, trip]);

  const activeDay = effectiveItinerary?.days?.find((d) => d.id === activeDayId) || effectiveItinerary?.days?.[0];
  const estimate = useMemo(
    () => estimateTripCost({ nights, adults: trip?.adults || 0, children: trip?.children || 0 }),
    [nights, trip?.adults, trip?.children]
  );
  const routeStops = useMemo(
    () => itineraryToRouteStops(effectiveItinerary, trip?.destination),
    [effectiveItinerary, trip?.destination]
  );

  const persistDays = (days) => {
    const next = { ...effectiveItinerary, days };
    setItinerary(next);
    saveItinerary(tripId, next).catch(() => {});
  };

  const onAddActivity = (activity) => {
    const targetDayId = activeDayId || effectiveItinerary?.days?.[0]?.id;
    const withId = { id: `${targetDayId}-${Date.now()}`, ...activity };
    addItineraryActivity(tripId, targetDayId, withId).catch(() => {});
    persistDays(
      effectiveItinerary.days.map((d) =>
        d.id === targetDayId ? { ...d, activities: [...(d.activities || []), withId] } : d
      )
    );
  };

  const onRemoveActivity = (activityId) => {
    const targetDayId = activeDayId || effectiveItinerary?.days?.[0]?.id;
    deleteItineraryActivity(tripId, targetDayId, activityId).catch(() => {});
    persistDays(
      effectiveItinerary.days.map((d) =>
        d.id === targetDayId ? { ...d, activities: (d.activities || []).filter((a) => a.id !== activityId) } : d
      )
    );
  };

  const onAddDay = () => {
    const day = {
      id: `day-${(effectiveItinerary?.days?.length || 0) + 1}-${Date.now()}`,
      index: (effectiveItinerary?.days?.length || 0) + 1,
      dayNumber: (effectiveItinerary?.days?.length || 0) + 1,
      label: "New day",
      dateLabel: "Add details",
      activities: [],
    };
    addItineraryDay(tripId, day).catch(() => {});
    persistDays([...(effectiveItinerary?.days || []), day]);
    setActiveDayId(day.id);
  };

  const onAddSuggestion = () => {
    onAddActivity({ time: "Suggested", title: "AI-recommended stop", note: AI_SUGGESTION_TEXT.split(".")[0] });
  };

  const onSaveNotes = (value) => {
    setNotes(value);
    updateTripNotes(tripId, value).catch(() => {});
  };

  const onOptimizeRoute = async () => {
    setOptimizing(true);
    try {
      const optimized = await optimizeTripRoute(tripId);
      if (optimized && optimized.days) {
        setItinerary(optimized);
      }
    } catch (e) {
      console.error("Optimization error:", e);
    } finally {
      setOptimizing(false);
    }
  };

  const onGenerateAI = async () => {
    setGeneratingAI(true);
    try {
      const generated = await generateItinerary(tripId, {
        destination: trip?.destination || "Trip",
        checkIn: checkIn,
        checkOut: checkOut,
        startDate: checkIn,
        endDate: checkOut,
        budget: trip?.budget || 50000,
        adults: trip?.adults || 2,
        children: trip?.children || 0,
      });
      if (generated && generated.days && generated.days.length > 0) {
        setItinerary(generated);
        setActiveDayId(generated.days[0]?.id);
      }
    } catch (e) {
      console.error("AI Generation error:", e);
    } finally {
      setGeneratingAI(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f6f5f1]">
        <Navbar user={user} />
        <div className="py-24 text-center text-sm text-slate-400">Loading your trip…</div>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="min-h-screen bg-[#f6f5f1]">
        <Navbar user={user} />
        <div className="mx-auto max-w-lg py-24 text-center">
          <p className="text-sm text-red-500">{error || "Trip not found."}</p>
          <Button className="mx-auto mt-5 w-auto px-6" onClick={() => navigate("/trips")}>
            Back to My trips
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f5f1]">
      <Navbar user={user} />

      <main className="mx-auto max-w-6xl px-6 py-10">
        {/* Trip Header Banner */}
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-display text-3xl font-semibold text-slate-900">{tripName}</h1>
              <StatusBadge status={trip.status} />
              {/* Weather Safety Chip */}
              {weatherAdvisory && (
                <button
                  onClick={() => setShowWeatherModal(true)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition shadow-sm ${
                    weatherAdvisory.status === "DANGER"
                      ? "bg-red-100 text-red-800 border border-red-300 hover:bg-red-200"
                      : weatherAdvisory.status === "CAUTION"
                      ? "bg-amber-100 text-amber-800 border border-amber-300 hover:bg-amber-200"
                      : "bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200"
                  }`}
                  title="Click to view full environmental hazard safety report"
                >
                  <span>{weatherAdvisory.metrics?.conditionIcon || "🌤️"}</span>
                  <span>
                    {weatherAdvisory.status === "DANGER"
                      ? "Hazard Alert"
                      : weatherAdvisory.status === "CAUTION"
                      ? "Weather Advisory"
                      : "Safe to Travel"}
                  </span>
                </button>
              )}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
              <span className="flex items-center gap-1 font-medium text-slate-700">
                <MapPin className="h-3.5 w-3.5 text-blue-600" /> {trip.destination}
              </span>
              {checkIn && checkOut && (
                <span>
                  {formatDateLabel(checkIn)} – {formatDateLabel(checkOut)} · <strong>{nights} nights</strong>
                </span>
              )}
              {travellers > 0 && (
                <span className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" /> {travellers} travellers
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              className="w-auto px-4"
              loading={generatingAI}
              onClick={onGenerateAI}
            >
              <Sparkles className="h-4 w-4 text-amber-500" /> Generate with AI
            </Button>
            <Button
              variant="primary"
              className="w-auto px-5"
              onClick={() =>
                navigate("/planner", {
                  state: {
                    tripId,
                    destination: trip.destination,
                    checkIn,
                    checkOut,
                    adults: trip.adults,
                    children: trip.children,
                    budget: trip.budget,
                  },
                })
              }
            >
              <Sparkles className="h-4 w-4" /> AI Planner
            </Button>
          </div>
        </div>

        {/* Live Weather & Environmental Hazard Widget */}
        <div className="mb-6">
          <TripWeatherWidget
            weatherData={weatherData}
            advisory={weatherAdvisory}
            loading={weatherLoading}
            onOpenAdvisory={() => setShowWeatherModal(true)}
            onRefresh={() => loadWeather(trip.destination)}
          />
        </div>

        <TripTabs active={tab} onChange={setTab} />

        <div className="mt-8">
          {tab === "overview" && (
            <OverviewTab
              trip={{ ...trip, name: tripName, checkIn, checkOut }}
              nights={nights}
              travellers={travellers}
              weatherAdvisory={weatherAdvisory}
              onOpenAdvisory={() => setShowWeatherModal(true)}
            />
          )}

          {tab === "itinerary" && effectiveItinerary && (
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[220px_1fr_300px]">
              <DayList
                days={effectiveItinerary.days}
                activeDayId={activeDay?.id || activeDayId}
                onSelect={setActiveDayId}
                onAddDay={onAddDay}
              />

              <div>
                {activeDay && (
                  <>
                    <h2 className="font-display text-xl font-semibold text-slate-900">
                      Day {activeDay.index || activeDay.dayNumber} — {activeDay.label || activeDay.title}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">{activeDay.dateLabel}</p>

                    <div className="mt-6">
                      {(activeDay.activities || []).map((activity, i) => (
                        <ActivityTimelineItem
                          key={activity.id}
                          activity={activity}
                          isLast={i === (activeDay.activities || []).length - 1}
                          onRemove={onRemoveActivity}
                        />
                      ))}
                    </div>
                    <AddActivityForm onAdd={onAddActivity} />
                  </>
                )}
              </div>

              <div className="space-y-5">
                <AccommodationCard stay={trip.stay} />
                <AISuggestionPanel
                  dayLabel={activeDay ? `Day ${activeDay.index || activeDay.dayNumber}` : "your trip"}
                  suggestion={{ text: AI_SUGGESTION_TEXT }}
                  onAdd={onAddSuggestion}
                />
                <TripNotesCard value={notes} onSave={onSaveNotes} />
              </div>
            </div>
          )}

          {tab === "map" && effectiveItinerary && (
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[280px_1fr]">
              <RouteStopList stops={routeStops} />
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <div className="text-sm font-semibold text-slate-800">
                    Route Map & Real-Time Tracking · {trip.destination}
                  </div>
                  <Button
                    variant="secondary"
                    className="w-auto px-4 py-1.5 text-xs"
                    loading={optimizing}
                    onClick={onOptimizeRoute}
                  >
                    <RotateCcw className="h-3.5 w-3.5" /> Optimise order
                  </Button>
                </div>
                <RouteMapCanvas stops={routeStops} destination={trip.destination} />
              </div>
            </div>
          )}

          {tab === "budget" && <CostEstimateCard estimate={estimate} />}

          {tab === "documents" && <DocumentsTab />}
        </div>
      </main>

      {/* Pre-Trip & Immediate Tour Weather Hazard Advisory Popup Modal */}
      <WeatherAdvisoryModal
        isOpen={showWeatherModal}
        onClose={() => setShowWeatherModal(false)}
        advisory={weatherAdvisory}
        loading={weatherLoading}
        isImmediate={isTripWithinSafetyWindow(checkIn)}
        onRefresh={() => loadWeather(trip.destination)}
      />
    </div>
  );
}

function OverviewTab({ trip, nights, travellers, weatherAdvisory, onOpenAdvisory }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <SummaryStat label="Destination" value={trip.destination} />
        <SummaryStat label="Trip length" value={`${nights} nights`} />
        <SummaryStat label="Travellers" value={`${travellers} people`} />
      </div>

      {weatherAdvisory && (
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-card">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Environmental Clearance
              </span>
              <h3 className="mt-1 font-display text-lg font-semibold text-slate-900">
                {weatherAdvisory.title}
              </h3>
              <p className="mt-1 text-sm text-slate-600 max-w-2xl font-medium">
                {weatherAdvisory.professionalVerdict}
              </p>
            </div>
            <button
              onClick={onOpenAdvisory}
              className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition"
            >
              Open Safety Report
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryStat({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-card">
      <span className="text-xs font-bold uppercase tracking-widest text-slate-400">{label}</span>
      <div className="mt-2 font-display text-xl font-semibold text-slate-900">{value}</div>
    </div>
  );
}

function DocumentsTab() {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center">
      <FileText className="mx-auto h-8 w-8 text-slate-300" />
      <p className="mt-3 text-sm text-slate-500">
        Tickets, vouchers and confirmations will show up here once bookings are made.
      </p>
      <button className="focus-ring mx-auto mt-5 flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">
        <Upload className="h-4 w-4" /> Upload a document
      </button>
    </div>
  );
}
