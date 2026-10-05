import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  Navigation,
  ExternalLink,
  Locate,
  LocateFixed,
  RotateCcw,
  Compass,
  X,
} from "lucide-react";

// High-performance Map Tile Providers with Default Natural Map Theme
const MAP_LAYERS = {
  googleRoads: {
    name: "Default Roadmap",
    url: "https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",
    attribution: "&copy; Google Maps",
    maxZoom: 20,
    subdomains: ["mt0", "mt1", "mt2", "mt3"],
  },
  googleSatellite: {
    name: "Satellite",
    url: "https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",
    attribution: "&copy; Google Maps Satellite",
    maxZoom: 20,
    subdomains: ["mt0", "mt1", "mt2", "mt3"],
  },
  googleTerrain: {
    name: "Terrain",
    url: "https://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}",
    attribution: "&copy; Google Maps Terrain",
    maxZoom: 20,
    subdomains: ["mt0", "mt1", "mt2", "mt3"],
  },
  osm: {
    name: "OpenStreetMap",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: "&copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a> contributors",
    maxZoom: 19,
    subdomains: ["a", "b", "c"],
  },
};

// Calculate distance in km between two GPS coordinates using Haversine formula
function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function RouteMapCanvas({
  stops = [],
  destination = "",
  centerCoords = null,
  activeDayNumber = null,
  onSelectDay = null,
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const markersGroupRef = useRef(null);
  const polylineRef = useRef(null);
  const userMarkerRef = useRef(null);
  const watchIdRef = useRef(null);

  const [viewMode, setViewMode] = useState("interactive"); // "interactive" | "embed"
  const [activeLayer, setActiveLayer] = useState("googleRoads");
  const [selectedDay, setSelectedDay] = useState(
    activeDayNumber !== null && activeDayNumber !== undefined ? String(activeDayNumber) : "all"
  );
  const [activeStop, setActiveStop] = useState(null);
  const [isTrackingLocation, setIsTrackingLocation] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [trackingError, setTrackingError] = useState("");

  // Sync with external activeDayNumber if provided and changed
  useEffect(() => {
    if (activeDayNumber !== null && activeDayNumber !== undefined) {
      setSelectedDay(String(activeDayNumber));
    }
  }, [activeDayNumber]);

  // Unique list of days present in stops
  const availableDays = useMemo(() => {
    const daysSet = new Set();
    stops.forEach((s) => {
      if (s.dayNumber) daysSet.add(s.dayNumber);
    });
    return Array.from(daysSet).sort((a, b) => a - b);
  }, [stops]);

  // Filter stops based on selected day
  const filteredStops = useMemo(() => {
    if (selectedDay === "all") return stops;
    return stops.filter((s) => String(s.dayNumber) === String(selectedDay));
  }, [stops, selectedDay]);

  // Calculate nearest stop to user location
  const nearestStopInfo = useMemo(() => {
    if (!userLocation || !stops.length) return null;
    let closest = null;
    let minDist = Infinity;
    stops.forEach((stop) => {
      if (stop.lat && stop.lng) {
        const d = calculateDistanceKm(userLocation.lat, userLocation.lng, stop.lat, stop.lng);
        if (d < minDist) {
          minDist = d;
          closest = stop;
        }
      }
    });
    return closest ? { stop: closest, distanceKm: minDist.toFixed(1) } : null;
  }, [userLocation, stops]);

  // Helper to recenter map view on the current itinerary stops
  const recenterOnRoute = useCallback(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Check that map container has been sized by browser layout
    const size = map.getSize();
    if (!size || size.x < 40 || size.y < 40) {
      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
          recenterOnRoute();
        }
      }, 150);
      return;
    }

    const targetStops = filteredStops.length > 0 ? filteredStops : stops;
    const latLngs = targetStops.filter((s) => s.lat && s.lng).map((s) => [s.lat, s.lng]);

    if (!latLngs.length) {
      if (centerCoords?.lat && centerCoords?.lng) {
        map.setView([centerCoords.lat, centerCoords.lng], 12);
      }
      return;
    }

    const bounds = L.latLngBounds(latLngs);
    if (bounds.isValid()) {
      const sw = bounds.getSouthWest();
      const ne = bounds.getNorthEast();
      const latSpan = Math.abs(sw.lat - ne.lat);
      const lngSpan = Math.abs(sw.lng - ne.lng);

      // If stops are within a city (span < 0.15 deg) or single stop, set city-level zoom
      if (latSpan < 0.15 && lngSpan < 0.15) {
        const center = bounds.getCenter();
        map.setView(center, Math.max(12, Math.min(14, map.getZoom() || 13)));
      } else {
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
      }
    }
  }, [filteredStops, stops, centerCoords]);

  const focusUserLocation = () => {
    if (userLocation && mapInstanceRef.current) {
      mapInstanceRef.current.setView([userLocation.lat, userLocation.lng], 15);
    }
  };

  const focusStop = (stop) => {
    if (stop?.lat && stop?.lng && mapInstanceRef.current) {
      mapInstanceRef.current.setView([stop.lat, stop.lng], 15);
    }
  };

  // 1. Initialize Leaflet map ONCE on mount
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const initialCenter =
        centerCoords?.lat && centerCoords?.lng
          ? [centerCoords.lat, centerCoords.lng]
          : stops[0]?.lat && stops[0]?.lng
          ? [stops[0].lat, stops[0].lng]
          : [28.6139, 77.2090]; // default New Delhi

      const map = L.map(mapContainerRef.current, {
        center: initialCenter,
        zoom: 12,
        minZoom: 3,
        maxZoom: 19,
        worldCopyJump: false,
        zoomControl: false,
      });

      L.control.zoom({ position: "bottomright" }).addTo(map);

      tileLayerRef.current = L.tileLayer(MAP_LAYERS[activeLayer].url, {
        attribution: MAP_LAYERS[activeLayer].attribution,
        maxZoom: MAP_LAYERS[activeLayer].maxZoom,
        minZoom: 3,
        noWrap: false,
        subdomains: MAP_LAYERS[activeLayer].subdomains || [],
      }).addTo(map);

      markersGroupRef.current = L.featureGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    // ResizeObserver to ensure map tile sizes stay accurate when container or layout changes
    let resizeObserver = null;
    if (window.ResizeObserver && mapContainerRef.current) {
      resizeObserver = new ResizeObserver(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      });
      resizeObserver.observe(mapContainerRef.current);
    }

    // Recenter after layout stabilizes
    const timer = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
        recenterOnRoute();
      }
    }, 150);

    return () => {
      clearTimeout(timer);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update map size whenever mode or tab becomes interactive
  useEffect(() => {
    if (viewMode === "interactive" && mapInstanceRef.current) {
      const timer = setTimeout(() => {
        mapInstanceRef.current?.invalidateSize();
        recenterOnRoute();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [viewMode, selectedDay, recenterOnRoute]);

  // Update map tiles when layer changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    if (tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
    }
    tileLayerRef.current = L.tileLayer(MAP_LAYERS[activeLayer].url, {
      attribution: MAP_LAYERS[activeLayer].attribution,
      maxZoom: MAP_LAYERS[activeLayer].maxZoom,
      minZoom: 3,
      noWrap: false,
      subdomains: MAP_LAYERS[activeLayer].subdomains || [],
    }).addTo(mapInstanceRef.current);
  }, [activeLayer]);

  // Render stops, route polylines, and popups
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !markersGroupRef.current) return;

    markersGroupRef.current.clearLayers();
    if (polylineRef.current) {
      map.removeLayer(polylineRef.current);
      polylineRef.current = null;
    }

    if (!filteredStops.length) return;

    const latLngs = [];

    filteredStops.forEach((stop, idx) => {
      if (!stop.lat || !stop.lng) return;
      const latLng = [stop.lat, stop.lng];
      latLngs.push(latLng);

      const isFirst = idx === 0;
      const isLast = idx === filteredStops.length - 1 && filteredStops.length > 1;
      const bgColor = isFirst ? "#10b981" : isLast ? "#f97316" : "#2563eb";

      // Display clean stop number: when day is filtered, show 1, 2, 3, 4
      const displayIndex = selectedDay !== "all" ? idx + 1 : (stop.stopIndex || idx + 1);

      // Custom HTML Pin Marker
      const customPinHtml = `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%); cursor: pointer;">
          <div style="
            background-color: ${bgColor};
            color: white;
            font-weight: 700;
            font-size: 11px;
            width: 28px;
            height: 28px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 12px rgba(0,0,0,0.35);
            border: 2px solid white;
          ">
            ${displayIndex}
          </div>
          <div style="
            width: 0;
            height: 0;
            border-left: 6px solid transparent;
            border-right: 6px solid transparent;
            border-top: 7px solid ${bgColor};
            margin-top: -1px;
          "></div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: customPinHtml,
        className: "custom-route-marker",
        iconSize: [0, 0],
        iconAnchor: [0, 0],
        popupAnchor: [0, -34],
      });

      const marker = L.marker(latLng, { icon: customIcon }).addTo(markersGroupRef.current);

      // Popup with stop details and direct Google Maps navigation button
      const googleMapsDirUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
        `${stop.name}, ${destination || stop.destination || ""}`
      )}`;

      const popupHtml = `
        <div style="font-family: sans-serif; padding: 4px; min-width: 220px; color: #1e293b;">
          <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: ${bgColor}; margin-bottom: 3px;">
            ${stop.dayLabel || "Stop"} · Stop ${stop.stopIndex || idx + 1}
          </div>
          <div style="font-size: 14px; font-weight: 700; color: #0f172a; margin-bottom: 4px; line-height: 1.25;">
            ${stop.name}
          </div>
          ${stop.time ? `<div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">⏰ ${stop.time}</div>` : ""}
          ${stop.note ? `<div style="font-size: 12px; color: #475569; margin-bottom: 8px; line-height: 1.35;">${stop.note}</div>` : ""}
          <a href="${googleMapsDirUrl}" target="_blank" rel="noopener noreferrer" style="
            display: inline-flex;
            align-items: center;
            gap: 5px;
            background-color: #2563eb;
            color: white;
            font-size: 11px;
            font-weight: 600;
            padding: 6px 12px;
            border-radius: 6px;
            text-decoration: none;
            margin-top: 4px;
          ">
            <span>Open in Google Maps</span> ↗
          </a>
        </div>
      `;

      marker.bindPopup(popupHtml);
      marker.on("click", () => setActiveStop(stop));
    });

    // Draw route connecting polyline
    if (latLngs.length > 1) {
      polylineRef.current = L.polyline(latLngs, {
        color: "#2563eb",
        weight: 4,
        opacity: 0.85,
        dashArray: "8, 8",
        lineCap: "round",
        lineJoin: "round",
      }).addTo(map);
    }

    // Fit map bounds safely to stops using container-aware recenterOnRoute
    if (latLngs.length > 0) {
      recenterOnRoute();
    }
  }, [filteredStops, destination, recenterOnRoute, selectedDay]);

  // Real-time GPS Location tracking
  const toggleLocationTracking = () => {
    setTrackingError("");

    if (isTrackingLocation) {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      if (userMarkerRef.current && mapInstanceRef.current) {
        mapInstanceRef.current.removeLayer(userMarkerRef.current);
        userMarkerRef.current = null;
      }
      setIsTrackingLocation(false);
      setUserLocation(null);
      return;
    }

    if (!("geolocation" in navigator)) {
      setTrackingError("Geolocation is not supported by your browser.");
      return;
    }

    setIsTrackingLocation(true);

    let hasCentered = false;

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        const latLng = [latitude, longitude];
        setUserLocation({ lat: latitude, lng: longitude, accuracy });

        const map = mapInstanceRef.current;
        if (!map) return;

        // Pulsing Blue Dot for Live Location
        const liveUserIcon = L.divIcon({
          html: `
            <div style="position: relative; width: 22px; height: 22px; transform: translate(-50%, -50%);">
              <div style="
                position: absolute;
                inset: -6px;
                border-radius: 50%;
                background-color: rgba(59, 130, 246, 0.4);
                animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
              "></div>
              <div style="
                position: relative;
                width: 22px;
                height: 22px;
                border-radius: 50%;
                background-color: #2563eb;
                border: 3px solid white;
                box-shadow: 0 0 10px rgba(0,0,0,0.3);
              "></div>
            </div>
            <style>
              @keyframes ping {
                75%, 100% { transform: scale(2); opacity: 0; }
              }
            </style>
          `,
          className: "user-gps-marker",
          iconSize: [0, 0],
        });

        if (!userMarkerRef.current) {
          userMarkerRef.current = L.marker(latLng, { icon: liveUserIcon, zIndexOffset: 1000 })
            .addTo(map)
            .bindPopup("<b>Your Real-Time Location</b>");
        } else {
          userMarkerRef.current.setLatLng(latLng);
        }

        // Only auto-center on user if they are within 50km of the trip stops
        if (!hasCentered) {
          hasCentered = true;
          const firstStop = filteredStops[0] || stops[0];
          if (firstStop?.lat && firstStop?.lng) {
            const d = calculateDistanceKm(latitude, longitude, firstStop.lat, firstStop.lng);
            if (d < 50) {
              map.setView(latLng, 14);
            }
          }
        }
      },
      (err) => {
        setTrackingError(`Location error: ${err.message}`);
        setIsTrackingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // Google Maps Full Route URL
  const googleMapsFullRouteUrl = useMemo(() => {
    if (!filteredStops.length) return "https://www.google.com/maps";
    const origin = filteredStops[0].name + ", " + (destination || "");
    const dest =
      filteredStops.length > 1
        ? filteredStops[filteredStops.length - 1].name + ", " + (destination || "")
        : origin;

    const waypoints = filteredStops
      .slice(1, -1)
      .map((s) => encodeURIComponent(s.name + ", " + (destination || "")))
      .join("|");

    let url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(dest)}`;
    if (waypoints) {
      url += `&waypoints=${waypoints}`;
    }
    return url;
  }, [filteredStops, destination]);

  // Google Maps Embed Query
  const googleMapsEmbedUrl = useMemo(() => {
    const query = destination ? `${destination} tourist attractions` : "popular tourist attractions";
    return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&t=m&z=11&output=embed&iwloc=near`;
  }, [destination]);

  return (
    <div className="space-y-4">
      {/* Top Map Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-card">
        {/* Day Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              setSelectedDay("all");
              if (onSelectDay) onSelectDay("all");
            }}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              selectedDay === "all"
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            All Stops ({stops.length})
          </button>
          {availableDays.map((dayNum) => (
            <button
              key={dayNum}
              type="button"
              onClick={() => {
                setSelectedDay(String(dayNum));
                if (onSelectDay) onSelectDay(Number(dayNum));
              }}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                selectedDay === String(dayNum)
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Day {dayNum}
            </button>
          ))}
        </div>

        {/* View toggles and live navigation */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Recenter on Route */}
          <button
            type="button"
            onClick={recenterOnRoute}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            title="Recenter view on trip route"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Center Route</span>
          </button>

          {/* Live GPS Track Button */}
          <button
            type="button"
            onClick={toggleLocationTracking}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
              isTrackingLocation
                ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm"
                : "border-slate-200 text-slate-700 hover:bg-slate-50"
            }`}
            title="Track your real-time GPS position"
          >
            {isTrackingLocation ? (
              <>
                <LocateFixed className="h-3.5 w-3.5 animate-spin text-blue-600" />
                <span>Tracking Live</span>
              </>
            ) : (
              <>
                <Locate className="h-3.5 w-3.5" />
                <span>Track My Route</span>
              </>
            )}
          </button>

          {/* Mode Switcher: Interactive Leaflet vs Google Embed */}
          <div className="flex items-center rounded-lg border border-slate-200 bg-slate-100 p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setViewMode("interactive")}
              className={`rounded-md px-2.5 py-1 font-semibold transition ${
                viewMode === "interactive"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Interactive Route
            </button>
            <button
              type="button"
              onClick={() => setViewMode("embed")}
              className={`rounded-md px-2.5 py-1 font-semibold transition ${
                viewMode === "embed"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Google View
            </button>
          </div>

          {/* Layer switcher - shown in interactive mode */}
          {viewMode === "interactive" && (
            <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setActiveLayer("googleRoads")}
                className={`rounded-md px-2 py-1 font-medium transition ${
                  activeLayer === "googleRoads" ? "bg-white text-slate-900 shadow-sm font-semibold" : "text-slate-500 hover:text-slate-900"
                }`}
                title="Default Map Theme (Google Maps Standard)"
              >
                Default
              </button>
              <button
                type="button"
                onClick={() => setActiveLayer("googleSatellite")}
                className={`rounded-md px-2 py-1 font-medium transition ${
                  activeLayer === "googleSatellite" ? "bg-white text-slate-900 shadow-sm font-semibold" : "text-slate-500 hover:text-slate-900"
                }`}
                title="Google Satellite Imagery"
              >
                Satellite
              </button>
              <button
                type="button"
                onClick={() => setActiveLayer("googleTerrain")}
                className={`rounded-md px-2 py-1 font-medium transition ${
                  activeLayer === "googleTerrain" ? "bg-white text-slate-900 shadow-sm font-semibold" : "text-slate-500 hover:text-slate-900"
                }`}
                title="Google Topography & Terrain"
              >
                Terrain
              </button>
              <button
                type="button"
                onClick={() => setActiveLayer("osm")}
                className={`rounded-md px-2 py-1 font-medium transition ${
                  activeLayer === "osm" ? "bg-white text-slate-900 shadow-sm font-semibold" : "text-slate-500 hover:text-slate-900"
                }`}
                title="OpenStreetMap Standard"
              >
                OSM
              </button>
            </div>
          )}

          {/* Direct Google Maps Directions Navigation Button */}
          <a
            href={googleMapsFullRouteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700 shadow-sm"
          >
            <Navigation className="h-3.5 w-3.5" />
            <span>Open in Google Maps</span>
            <ExternalLink className="h-3 w-3 opacity-80" />
          </a>
        </div>
      </div>

      {/* Live Route Distance Tracker Banner */}
      {nearestStopInfo && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-blue-50 px-4 py-2.5 text-xs text-blue-900 border border-blue-200">
          <div className="flex items-center gap-2">
            <Compass className="h-4 w-4 text-blue-600 animate-spin flex-shrink-0" />
            <span>
              {Number(nearestStopInfo.distanceKm) > 50 ? (
                <>
                  <strong>Planning Mode:</strong> Your current location is approx.{" "}
                  <strong>{nearestStopInfo.distanceKm} km</strong> from {destination || "your destination"}. Nearest stop:{" "}
                  <strong>{nearestStopInfo.stop.name}</strong> ({nearestStopInfo.stop.dayLabel})
                </>
              ) : (
                <>
                  <strong>Real-Time Tracking:</strong> You are approx.{" "}
                  <strong>{nearestStopInfo.distanceKm} km</strong> from{" "}
                  <strong>{nearestStopInfo.stop.name}</strong> ({nearestStopInfo.stop.dayLabel})
                </>
              )}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={recenterOnRoute}
              className="rounded-md bg-white px-2.5 py-1 text-xs font-bold text-blue-700 border border-blue-300 hover:bg-blue-100 transition"
            >
              Focus Trip Route
            </button>
            <button
              type="button"
              onClick={focusUserLocation}
              className="rounded-md bg-white px-2.5 py-1 text-xs font-bold text-blue-700 border border-blue-300 hover:bg-blue-100 transition"
            >
              My GPS Location
            </button>
            <a
              href={`https://www.google.com/maps/dir/?api=1&origin=${userLocation?.lat},${userLocation?.lng}&destination=${nearestStopInfo.stop.lat},${nearestStopInfo.stop.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md bg-blue-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-blue-700 transition"
            >
              Navigate Now ↗
            </a>
          </div>
        </div>
      )}

      {trackingError && (
        <div className="rounded-xl bg-amber-50 px-4 py-2 text-xs text-amber-700 border border-amber-200">
          {trackingError}
        </div>
      )}

      {/* Map Display Viewport */}
      <div className="relative w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-card">
        {/* Interactive Leaflet Map (Kept in DOM so state/instances aren't wiped on toggle) */}
        <div
          ref={mapContainerRef}
          className={`h-[520px] w-full z-0 transition-opacity duration-200 ${
            viewMode === "interactive" ? "block opacity-100" : "hidden opacity-0 pointer-events-none"
          }`}
          style={{ minHeight: "480px" }}
        />

        {/* Google Maps Embed View */}
        {viewMode === "embed" && (
          <iframe
            title="Google Maps Route"
            src={googleMapsEmbedUrl}
            className="h-[520px] w-full border-0"
            loading="lazy"
            allowFullScreen
          />
        )}

        {/* Active Stop Card Popup Floating on Map */}
        {activeStop && viewMode === "interactive" && (
          <div className="absolute top-4 right-4 z-[500] max-w-sm rounded-xl bg-white/95 p-3.5 shadow-xl border border-slate-200 backdrop-blur-md transition-all animate-fadeIn">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="inline-block rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-700 border border-blue-200">
                  {activeStop.dayLabel || "Stop"} · Stop {activeStop.stopIndex}
                </span>
                <h4 className="mt-1 font-bold text-slate-900 text-sm">{activeStop.name}</h4>
                {activeStop.time && (
                  <p className="mt-0.5 text-xs text-slate-500 font-medium">⏰ {activeStop.time}</p>
                )}
                {activeStop.note && (
                  <p className="mt-1 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {activeStop.note}
                  </p>
                )}
                <div className="mt-2.5 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => focusStop(activeStop)}
                    className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition"
                  >
                    Zoom In
                  </button>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                      `${activeStop.name}, ${destination || activeStop.destination || ""}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-md bg-blue-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-blue-700 transition"
                  >
                    <span>Directions</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveStop(null)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
                title="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Map Legend Overlay */}
        <div className="absolute bottom-4 left-4 z-[500] flex flex-wrap items-center gap-2 rounded-xl bg-white/95 px-3 py-2 text-xs font-semibold text-slate-700 shadow-md backdrop-blur-sm border border-slate-200">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-emerald-500 border border-white"></span>
            <span>Arrival / Start</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-blue-600 border border-white"></span>
            <span>Sightseeing Stop</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-orange-500 border border-white"></span>
            <span>Final Stop</span>
          </div>
          {isTrackingLocation && (
            <div className="flex items-center gap-1.5 text-blue-600">
              <span className="h-3 w-3 rounded-full bg-blue-500 animate-ping"></span>
              <span>Live GPS</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
