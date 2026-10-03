import {
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  Wind,
  CloudRain,
  X,
  CheckCircle2,
  RefreshCw,
  Thermometer,
} from "lucide-react";

export default function WeatherAdvisoryModal({
  isOpen,
  onClose,
  advisory,
  loading = false,
  onRefresh,
  isImmediate = false,
}) {
  if (!isOpen) return null;

  const isSafe = advisory?.status === "SAFE";
  const isCaution = advisory?.status === "CAUTION";

  const themeConfig = {
    SAFE: {
      accent: "emerald",
      badgeBg: "bg-emerald-100 text-emerald-800 border-emerald-300",
      modalBorder: "border-emerald-500",
      headerBg: "bg-gradient-to-r from-emerald-600 to-teal-700",
      iconBg: "bg-emerald-500/20 text-emerald-300",
      statusLabel: "SAFE TO TRAVEL · GREEN LIGHT",
      icon: <ShieldCheck className="h-7 w-7 text-white" />,
    },
    CAUTION: {
      accent: "amber",
      badgeBg: "bg-amber-100 text-amber-800 border-amber-300",
      modalBorder: "border-amber-500",
      headerBg: "bg-gradient-to-r from-amber-600 to-orange-600",
      iconBg: "bg-amber-500/20 text-amber-200",
      statusLabel: "TRAVEL ADVISORY · EXERCISE CAUTION",
      icon: <AlertTriangle className="h-7 w-7 text-white" />,
    },
    DANGER: {
      accent: "rose",
      badgeBg: "bg-rose-100 text-rose-800 border-rose-300",
      modalBorder: "border-rose-600",
      headerBg: "bg-gradient-to-r from-red-600 to-rose-700",
      iconBg: "bg-rose-500/20 text-rose-200",
      statusLabel: "NATURAL HAZARD WARNING · TRAVEL NOT ADVISED",
      icon: <AlertOctagon className="h-7 w-7 text-white" />,
    },
  }[advisory?.status || "SAFE"];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`relative w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl border-2 ${themeConfig.modalBorder} transition-all`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header Banner */}
        <div className={`px-6 py-5 text-white ${themeConfig.headerBg} relative`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md shadow-inner">
                {themeConfig.icon}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-white/90">
                    {isImmediate ? "⚡ Immediate Tour Real-Time Safety Check" : "🛡️ Pre-Trip Environmental Advisory"}
                  </span>
                </div>
                <h2 className="text-xl font-bold tracking-tight text-white">
                  {advisory?.destination ? advisory.destination.toUpperCase() : "DESTINATION"} WEATHER SAFETY
                </h2>
              </div>
            </div>

            <button
              onClick={onClose}
              className="rounded-full p-2 text-white/80 hover:bg-white/20 hover:text-white transition"
              aria-label="Close Advisory"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Status Chip */}
          <div className="mt-3 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-sm backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-white animate-ping"></span>
              {themeConfig.statusLabel}
            </span>
            {advisory?.metrics && (
              <span className="text-xs text-white/80">
                Temp: {advisory.metrics.temperature}°C · Wind: {advisory.metrics.windSpeedKmh} km/h · Rain: {advisory.metrics.precipitationMm} mm
              </span>
            )}
          </div>
        </div>

        {/* Modal Content Body */}
        <div className="max-h-[70vh] overflow-y-auto p-6 space-y-5">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500 space-y-3">
              <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
              <p className="text-sm font-medium">Analyzing real-time atmospheric radar & terrain hazard indexes...</p>
            </div>
          ) : (
            <>
              {/* Professional Verdict & Reason Callout */}
              <div
                className={`rounded-2xl p-5 border ${
                  isSafe
                    ? "bg-emerald-50/80 border-emerald-200 text-emerald-950"
                    : isCaution
                    ? "bg-amber-50/80 border-amber-200 text-amber-950"
                    : "bg-red-50/80 border-red-200 text-red-950"
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className="mt-0.5">
                    {isSafe ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    ) : isCaution ? (
                      <AlertTriangle className="h-5 w-5 text-amber-600" />
                    ) : (
                      <AlertOctagon className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-bold text-sm leading-tight">
                      {advisory?.title || "Environmental Safety Report"}
                    </h3>
                    <p className="text-xs leading-relaxed opacity-90 font-medium">
                      {advisory?.professionalVerdict}
                    </p>
                    {advisory?.recommendation && (
                      <div className="pt-2 text-xs border-t border-black/10 font-semibold">
                        <span className="uppercase text-[10px] tracking-wider text-slate-500 block mb-0.5">
                          Professional Advisory Recommendation:
                        </span>
                        {advisory.recommendation}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Hazard Breakdown Cards (Heavy rain, high wind speed, landslide risk) */}
              {advisory?.hazards && advisory.hazards.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Detected Natural Hazards & Environmental Stressors ({advisory.hazards.length})
                  </h4>

                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    {advisory.hazards.map((hazard, idx) => (
                      <div
                        key={idx}
                        className={`rounded-xl p-3.5 border transition ${
                          hazard.severity === "DANGER"
                            ? "border-red-200 bg-red-50/50"
                            : "border-amber-200 bg-amber-50/50"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-lg">{hazard.icon}</span>
                          <span
                            className={`text-xs font-bold uppercase tracking-wider ${
                              hazard.severity === "DANGER" ? "text-red-700" : "text-amber-700"
                            }`}
                          >
                            {hazard.title}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 leading-normal">
                          {hazard.detail}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Safe Conditions Summary (When green light) */}
              {isSafe && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                    <Wind className="h-4 w-4 text-emerald-600 mx-auto mb-1" />
                    <div className="text-[11px] font-bold text-slate-700">Calm Winds</div>
                    <div className="text-xs text-slate-500">{advisory?.metrics?.windSpeedKmh} km/h</div>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                    <CloudRain className="h-4 w-4 text-emerald-600 mx-auto mb-1" />
                    <div className="text-[11px] font-bold text-slate-700">Minimal Rain</div>
                    <div className="text-xs text-slate-500">{advisory?.metrics?.precipitationMm} mm</div>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                    <Mountain className="h-4 w-4 text-emerald-600 mx-auto mb-1" />
                    <div className="text-[11px] font-bold text-slate-700">Terrain Status</div>
                    <div className="text-xs text-emerald-600 font-semibold">Stable & Open</div>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                    <Thermometer className="h-4 w-4 text-emerald-600 mx-auto mb-1" />
                    <div className="text-[11px] font-bold text-slate-700">Temperature</div>
                    <div className="text-xs text-slate-500">{advisory?.metrics?.temperature}°C</div>
                  </div>
                </div>
              )}

              {/* Upcoming Multi-day Forecast Strip */}
              {advisory?.forecastDays && advisory.forecastDays.length > 0 && (
                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                    <span>5-Day Meteorological Projection</span>
                    <span className="text-[10px] font-normal text-slate-400">Powered by Open-Meteo</span>
                  </h4>
                  <div className="grid grid-cols-5 gap-2">
                    {advisory.forecastDays.map((day, dIdx) => (
                      <div
                        key={dIdx}
                        className="rounded-xl border border-slate-100 bg-slate-50/60 p-2 text-center"
                      >
                        <div className="text-[10px] font-semibold text-slate-500">
                          {new Date(day.date).toLocaleDateString("en-IN", { weekday: "short" })}
                        </div>
                        <div className="my-1 text-lg">{day.icon}</div>
                        <div className="text-xs font-bold text-slate-800">
                          {day.maxTemp}° / {day.minTemp}°
                        </div>
                        <div className="text-[10px] text-blue-600 font-medium">
                          {day.rainSum > 0 ? `${day.rainSum}mm` : "Dry"}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Bottom Action Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4">
          <div className="flex items-center gap-2">
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={loading}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
                <span>Re-check Live Radar</span>
              </button>
            )}
            <span className="text-[11px] text-slate-400">
              Evaluated {advisory?.evaluatedAt ? new Date(advisory.evaluatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "recently"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className={`rounded-xl px-5 py-2 text-xs font-bold text-white transition shadow-sm ${
                isSafe
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : isCaution
                  ? "bg-amber-600 hover:bg-amber-700"
                  : "bg-red-600 hover:bg-red-700"
              }`}
            >
              {isSafe ? "I Understand & Proceed" : "Acknowledge Safety Notice"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
