import {
  CloudRain,
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  ChevronRight,
  RefreshCw,
  Droplets,
} from "lucide-react";

export default function TripWeatherWidget({
  weatherData,
  advisory,
  loading = false,
  onOpenAdvisory,
  onRefresh,
}) {
  const isCaution = advisory?.status === "CAUTION";
  const isDanger = advisory?.status === "DANGER";
  const humidity = weatherData?.current?.relative_humidity_2m;

  const statusBadge = isDanger ? (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-800 border border-red-200">
      <AlertOctagon className="h-3.5 w-3.5 text-red-600" />
      <span>Hazard Alert</span>
    </span>
  ) : isCaution ? (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800 border border-amber-200">
      <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
      <span>Weather Advisory</span>
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 border border-emerald-200">
      <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
      <span>Safe to Travel</span>
    </span>
  );

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-card space-y-4">

      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <CloudRain className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Weather & Environmental Safety
            </h3>
            <p className="text-xs text-slate-500">
              Live meteorological telemetry for {advisory?.destination || "Destination"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {statusBadge}
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={loading}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition"
              title="Refresh weather data"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          )}
        </div>
      </div>

      {/* Main Weather Metrics Overview */}
      {loading ? (
        <div className="py-6 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
          <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
          <span>Fetching live atmospheric radar data...</span>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Temperature */}
            <div className="rounded-xl bg-slate-50 p-3">
              <div className="text-[11px] font-semibold text-slate-500">Temperature</div>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-xl font-bold text-slate-900">
                  {advisory?.metrics?.temperature ?? "--"}°C
                </span>
                <span className="text-xs text-slate-500">
                  {advisory?.metrics?.conditionIcon} {advisory?.metrics?.condition}
                </span>
              </div>
            </div>

            {/* Wind Speed */}
            <div className="rounded-xl bg-slate-50 p-3">
              <div className="text-[11px] font-semibold text-slate-500">Wind Velocity</div>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-xl font-bold text-slate-900">
                  {advisory?.metrics?.windSpeedKmh ?? "--"}
                </span>
                <span className="text-xs text-slate-500">km/h</span>
              </div>
            </div>

            {/* Precipitation & Humidity */}
            <div className="rounded-xl bg-slate-50 p-3">
              <div className="text-[11px] font-semibold text-slate-500 flex items-center justify-between">
                <span>Precipitation</span>
                {humidity !== undefined && (
                  <span className="flex items-center gap-0.5 text-[10px] text-slate-400 font-medium">
                    <Droplets className="h-3 w-3 text-blue-500" /> {humidity}%
                  </span>
                )}
              </div>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-xl font-bold text-slate-900">
                  {advisory?.metrics?.precipitationMm ?? 0}
                </span>
                <span className="text-xs text-slate-500">mm</span>
              </div>
            </div>


            {/* Safety Verdict */}
            <div
              className={`rounded-xl p-3 border ${
                isDanger
                  ? "bg-red-50 border-red-200"
                  : isCaution
                  ? "bg-amber-50 border-amber-200"
                  : "bg-emerald-50 border-emerald-200"
              }`}
            >
              <div
                className={`text-[11px] font-semibold ${
                  isDanger
                    ? "text-red-700"
                    : isCaution
                    ? "text-amber-700"
                    : "text-emerald-700"
                }`}
              >
                Terrain Status
              </div>
              <div
                className={`mt-1 text-xs font-bold ${
                  isDanger
                    ? "text-red-900"
                    : isCaution
                    ? "text-amber-900"
                    : "text-emerald-900"
                }`}
              >
                {advisory?.metrics?.isHillyTerrain
                  ? isDanger
                    ? "High Landslide Risk"
                    : "Ghat Roads Open"
                  : "Stable Terrain"}
              </div>
            </div>
          </div>

          {/* Quick Verdict Summary Banner with Action Button */}
          <div
            className={`flex flex-wrap items-center justify-between gap-3 rounded-xl p-3.5 border ${
              isDanger
                ? "bg-red-50/70 border-red-200 text-red-950"
                : isCaution
                ? "bg-amber-50/70 border-amber-200 text-amber-950"
                : "bg-emerald-50/70 border-emerald-200 text-emerald-950"
            }`}
          >
            <p className="text-xs leading-relaxed max-w-xl font-medium">
              <strong>{advisory?.title}:</strong> {advisory?.professionalVerdict}
            </p>

            <button
              onClick={onOpenAdvisory}
              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold text-white transition shadow-sm ${
                isDanger
                  ? "bg-red-600 hover:bg-red-700"
                  : isCaution
                  ? "bg-amber-600 hover:bg-amber-700"
                  : "bg-emerald-600 hover:bg-emerald-700"
              }`}
            >
              <span>View Safety Report</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
