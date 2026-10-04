import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  MapPin,
  Users,
  RotateCcw,
  Sparkles,
  FileText,
  Upload,
  Plus,
  Trash2,
  Download,
  AlertCircle,
  CheckCircle2,
  X,
  FileCheck,
} from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
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
import {
  getTrip,
  updateTripStay,
  listTripDocuments,
  uploadTripDocument,
  deleteTripDocument,
} from "../../api/trips";
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
  const [actionMessage, setActionMessage] = useState(null);
  const [optimizing, setOptimizing] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);

  // Documents state
  const [documents, setDocuments] = useState([]);

  // Weather & Natural Hazard Advisory State
  const [weatherData, setWeatherData] = useState(null);
  const [weatherAdvisory, setWeatherAdvisory] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [showWeatherModal, setShowWeatherModal] = useState(false);

  // Load the trip record, then its itinerary
  useEffect(() => {
    let cancelled = false;
    getTrip(tripId)
      .then((tripData) => {
        if (cancelled) return;
        setTrip(tripData);
        setNotes(tripData?.notes || "");
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

  // Load documents
  useEffect(() => {
    let cancelled = false;
    listTripDocuments(tripId)
      .then((data) => {
        if (cancelled) return;
        const list = Array.isArray(data) ? data : data?.content || [];
        setDocuments(list);
      })
      .catch(() => {
        try {
          const cached = localStorage.getItem(`pmt_docs_${tripId}`);
          if (cached && !cancelled) setDocuments(JSON.parse(cached));
        } catch {
          // ignore cache errors
        }
      });
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
  const loadWeather = useCallback(
    (destination) => {
      if (!destination) return undefined;
      const timer = setTimeout(() => {
        setWeatherLoading(true);
        fetchDestinationWeather(destination)
          .then((data) => {
            setWeatherData(data);
            const advisory = evaluateWeatherSafety(data, { startDate: checkIn });
            setWeatherAdvisory(advisory);

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
      }, 0);

      return () => clearTimeout(timer);
    },
    [checkIn, tripId]
  );


  useEffect(() => {
    if (trip?.destination) {
      loadWeather(trip.destination);
    }
  }, [trip?.destination, loadWeather]);

  const effectiveItinerary = useMemo(() => {
    if (itinerary && itinerary.days && itinerary.days.length > 0) return itinerary;
    if (trip) return buildFallbackItinerary(trip);
    return null;
  }, [itinerary, trip]);

  const activeDay =
    effectiveItinerary?.days?.find((d) => d.id === activeDayId) ||
    effectiveItinerary?.days?.[0];

  const estimate = useMemo(
    () =>
      estimateTripCost({
        nights,
        adults: trip?.adults || 0,
        children: trip?.children || 0,
      }),
    [nights, trip?.adults, trip?.children]
  );

  const routeStops = useMemo(
    () =>
      itineraryToRouteStops(
        effectiveItinerary,
        trip?.destination,
        weatherData?.coords
      ),
    [effectiveItinerary, trip?.destination, weatherData?.coords]
  );

  const persistDays = async (days) => {
    const next = { ...effectiveItinerary, days };
    setItinerary(next);
    try {
      await saveItinerary(tripId, next);
      setActionMessage({ type: "success", text: "Itinerary updated successfully." });
    } catch (err) {
      setActionMessage({ type: "error", text: `Server sync notice: ${err.message}` });
    }
  };

  const onAddActivity = async (activity) => {
    const targetDayId = activeDayId || effectiveItinerary?.days?.[0]?.id;
    const withId = { id: `${targetDayId}-${Date.now()}`, ...activity };
    const nextDays = (effectiveItinerary?.days || []).map((d) =>
      d.id === targetDayId
        ? { ...d, activities: [...(d.activities || []), withId] }
        : d
    );
    persistDays(nextDays);
    try {
      await addItineraryActivity(tripId, targetDayId, withId);
    } catch {
      // optimistic update maintained
    }
  };

  const onRemoveActivity = async (activityId) => {
    const targetDayId = activeDayId || effectiveItinerary?.days?.[0]?.id;
    const nextDays = (effectiveItinerary?.days || []).map((d) =>
      d.id === targetDayId
        ? { ...d, activities: (d.activities || []).filter((a) => a.id !== activityId) }
        : d
    );
    persistDays(nextDays);
    try {
      await deleteItineraryActivity(tripId, targetDayId, activityId);
    } catch {
      // optimistic update maintained
    }
  };

  const onAddDay = async () => {
    const newIndex = (effectiveItinerary?.days?.length || 0) + 1;
    const day = {
      id: `day-${newIndex}-${Date.now()}`,
      index: newIndex,
      dayNumber: newIndex,
      label: `Day ${newIndex}`,
      dateLabel: "Custom plan",
      activities: [],
    };
    persistDays([...(effectiveItinerary?.days || []), day]);
    setActiveDayId(day.id);
    try {
      await addItineraryDay(tripId, day);
    } catch {
      // optimistic update maintained
    }
  };

  const onAddSuggestion = () => {
    onAddActivity({
      time: "Suggested",
      title: "AI-recommended stop",
      note: AI_SUGGESTION_TEXT.split(".")[0],
    });
  };

  const onSaveNotes = async (value) => {
    setNotes(value);
    try {
      await updateTripNotes(tripId, value);
      setActionMessage({ type: "success", text: "Notes saved." });
    } catch (err) {
      setActionMessage({ type: "error", text: `Could not save notes: ${err.message}` });
    }
  };

  const onSaveStay = async (stay) => {
    setTrip((prev) => ({ ...prev, stay }));
    try {
      await updateTripStay(tripId, stay);
      setActionMessage({ type: "success", text: "Accommodation saved to trip." });
    } catch (err) {
      setActionMessage({ type: "error", text: `Could not update stay: ${err.message}` });
    }
  };

  const onOptimizeRoute = async () => {
    setOptimizing(true);
    setActionMessage(null);
    try {
      const optimized = await optimizeTripRoute(tripId);
      if (optimized && optimized.days) {
        setItinerary(optimized);
        setActionMessage({
          type: "success",
          text: "Route stops reordered for optimal transit!",
        });
      }
    } catch (e) {
      setActionMessage({ type: "error", text: `Optimization note: ${e.message}` });
    } finally {
      setOptimizing(false);
    }
  };

  const onGenerateAI = async () => {
    setGeneratingAI(true);
    setActionMessage(null);
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
        setActionMessage({
          type: "success",
          text: "Fresh AI itinerary generated and synchronized!",
        });
      }
    } catch (e) {
      setActionMessage({ type: "error", text: `AI generation notice: ${e.message}` });
    } finally {
      setGeneratingAI(false);
    }
  };

  const onUploadDoc = async (newDoc) => {
    try {
      const savedDoc = await uploadTripDocument(tripId, newDoc);
      const docItem = savedDoc || { ...newDoc, id: `doc-${Date.now()}` };
      const nextDocs = [...documents, docItem];
      setDocuments(nextDocs);
      localStorage.setItem(`pmt_docs_${tripId}`, JSON.stringify(nextDocs));
      setActionMessage({ type: "success", text: `Attached document "${newDoc.title}".` });
    } catch (err) {
      const fallbackDoc = { ...newDoc, id: `doc-${Date.now()}` };
      const nextDocs = [...documents, fallbackDoc];
      setDocuments(nextDocs);
      localStorage.setItem(`pmt_docs_${tripId}`, JSON.stringify(nextDocs));
      setActionMessage({
        type: "success",
        text: `"${newDoc.title}" stored. (Backend sync note: ${err.message})`,
      });
    }
  };

  const onDeleteDoc = async (docId) => {
    try {
      await deleteTripDocument(tripId, docId);
    } catch {
      // continue local cleanup
    }
    const nextDocs = documents.filter((d) => d.id !== docId);
    setDocuments(nextDocs);
    localStorage.setItem(`pmt_docs_${tripId}`, JSON.stringify(nextDocs));
    setActionMessage({ type: "success", text: "Document removed." });
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
        {/* Action feedback toast / banner */}
        {actionMessage && (
          <div
            className={`mb-6 flex items-center justify-between rounded-xl p-3.5 text-sm font-medium border ${
              actionMessage.type === "error"
                ? "bg-red-50 border-red-200 text-red-800"
                : "bg-emerald-50 border-emerald-200 text-emerald-800"
            }`}
          >
            <div className="flex items-center gap-2">
              {actionMessage.type === "error" ? (
                <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
              ) : (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              )}
              <span>{actionMessage.text}</span>
            </div>
            <button
              onClick={() => setActionMessage(null)}
              className="text-xs font-bold hover:underline opacity-75 hover:opacity-100"
            >
              Dismiss
            </button>
          </div>
        )}

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
                {activeDay ? (
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
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center">
                    <p className="text-slate-500 text-sm">No days in this itinerary yet.</p>
                    <Button onClick={onAddDay} className="mt-4 w-auto mx-auto px-4">
                      + Add Day 1
                    </Button>
                  </div>
                )}
              </div>

              <div className="space-y-5">
                <AccommodationCard
                  stay={trip.stay}
                  onSaveStay={onSaveStay}
                  destination={trip.destination}
                />
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
                <RouteMapCanvas
                  stops={routeStops}
                  destination={trip.destination}
                  centerCoords={weatherData?.coords}
                />
              </div>
            </div>
          )}

          {tab === "budget" && <CostEstimateCard estimate={estimate} />}

          {tab === "documents" && (
            <DocumentsTab
              documents={documents}
              onUploadDoc={onUploadDoc}
              onDeleteDoc={onDeleteDoc}
            />
          )}
        </div>
      </main>

      {/* Pre-Trip Weather Hazard Advisory Popup Modal */}
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

function DocumentsTab({ documents = [], onUploadDoc, onDeleteDoc }) {
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Flight Ticket");
  const [fileDetails, setFileDetails] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setFileDetails({
          fileName: file.name,
          fileSize: `${(file.size / 1024).toFixed(1)} KB`,
          dataUrl: reader.result,
        });
        if (!title) setTitle(file.name.replace(/\.[^/.]+$/, ""));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    onUploadDoc({
      title: title.trim(),
      category,
      fileName: fileDetails?.fileName || `${title}.pdf`,
      fileSize: fileDetails?.fileSize || "140 KB",
      dataUrl: fileDetails?.dataUrl || null,
      uploadedAt: new Date().toLocaleDateString(),
    });

    setTitle("");
    setFileDetails(null);
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-xl font-semibold text-slate-900">Trip Documents</h3>
          <p className="text-xs text-slate-500 mt-1">
            Store tickets, vouchers, hotel reservations, and travel insurance in one secure place.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 rounded-xl bg-emerald-700 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-800 transition"
        >
          <Plus className="h-4 w-4" /> Upload Document
        </button>
      </div>

      {documents.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center">
          <FileText className="mx-auto h-10 w-10 text-slate-300" />
          <h4 className="mt-3 text-sm font-semibold text-slate-700">No documents uploaded yet</h4>
          <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
            Keep your flight boarding passes, hotel confirmations, and identity documents ready for your trip.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="focus-ring mx-auto mt-5 flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            <Upload className="h-4 w-4" /> Upload your first document
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-100 bg-white p-4 shadow-sm hover:shadow-card transition"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
                      <FileCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 leading-snug line-clamp-1">
                        {doc.title}
                      </h4>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full inline-block mt-0.5">
                        {doc.category || "General"}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => onDeleteDoc(doc.id)}
                    className="p-1 text-slate-400 hover:text-red-600 transition rounded-lg hover:bg-red-50"
                    title="Remove document"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-3 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>{doc.fileName || "document.pdf"}</span>
                  <span>{doc.fileSize || "PDF"}</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-400">Added {doc.uploadedAt || "recently"}</span>
                {doc.dataUrl ? (
                  <a
                    href={doc.dataUrl}
                    download={doc.fileName || `${doc.title}.pdf`}
                    className="flex items-center gap-1 font-semibold text-emerald-700 hover:underline"
                  >
                    <Download className="h-3.5 w-3.5" /> Download
                  </a>
                ) : (
                  <span className="text-[11px] text-slate-400">Verified</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-panel">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-display text-lg font-semibold text-slate-900">Upload Trip Document</h3>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <Input
                label="Document Title"
                placeholder="e.g. Flight to Destination - Ticket"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                >
                  <option value="Flight Ticket">Flight Ticket</option>
                  <option value="Hotel Voucher">Hotel Voucher</option>
                  <option value="Passport / Visa">Passport / Visa</option>
                  <option value="Activity Booking">Activity Booking</option>
                  <option value="Travel Insurance">Travel Insurance</option>
                  <option value="Other">Other Document</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                  Attach File (PDF, PNG, JPG)
                </label>
                <input
                  type="file"
                  accept=".pdf,image/*"
                  onChange={handleFileChange}
                  className="w-full text-xs text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-50 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-emerald-700 hover:file:bg-emerald-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowModal(false)}
                  className="w-auto px-4"
                >
                  Cancel
                </Button>
                <Button type="submit" className="w-auto px-5">
                  Save Document
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
