import { getDestinationCenter, normalizeDestinationName, setResolvedDestinationCoords } from "./itineraryFallback";

// Hilly / Mountainous regions susceptible to landslides & mudslides during heavy precipitation
const HILL_REGIONS = [
  "kerala",
  "munnar",
  "wayanad",
  "thekkady",
  "vagamon",
  "idukki",
  "ooty",
  "kodaikanal",
  "coorg",
  "chikmagalur",
  "western ghats",
  "manali",
  "shimla",
  "dharamshala",
  "mcleodganj",
  "kasol",
  "spiti",
  "rishikesh",
  "mussoorie",
  "nainital",
  "dehradun",
  "darjeeling",
  "gangtok",
  "sikkim",
  "shillong",
  "meghalaya",
  "cherrapunji",
  "pahalgam",
  "gulmarg",
  "kashmir",
  "ladakh",
  "leh",
];

// WMO Weather Interpretation Codes (WMO 4677)
const WMO_DESCRIPTIONS = {
  0: { label: "Clear Sky", icon: "☀️", isStorm: false, isRain: false },
  1: { label: "Mainly Clear", icon: "🌤️", isStorm: false, isRain: false },
  2: { label: "Partly Cloudy", icon: "⛅", isStorm: false, isRain: false },
  3: { label: "Overcast", icon: "☁️", isStorm: false, isRain: false },
  45: { label: "Foggy", icon: "🌫️", isStorm: false, isRain: false },
  48: { label: "Depositing Rime Fog", icon: "🌫️", isStorm: false, isRain: false },
  51: { label: "Light Drizzle", icon: "🌦️", isStorm: false, isRain: true },
  53: { label: "Moderate Drizzle", icon: "🌦️", isStorm: false, isRain: true },
  55: { label: "Dense Drizzle", icon: "🌧️", isStorm: false, isRain: true },
  61: { label: "Slight Rain", icon: "🌧️", isStorm: false, isRain: true },
  63: { label: "Moderate Rain", icon: "🌧️", isStorm: false, isRain: true },
  65: { label: "Heavy Rain", icon: "⛈️", isStorm: false, isRain: true },
  66: { label: "Light Freezing Rain", icon: "🌨️", isStorm: false, isRain: true },
  67: { label: "Heavy Freezing Rain", icon: "🌨️", isStorm: false, isRain: true },
  71: { label: "Slight Snow", icon: "❄️", isStorm: false, isRain: false },
  73: { label: "Moderate Snow", icon: "❄️", isStorm: false, isRain: false },
  75: { label: "Heavy Snow", icon: "❄️", isStorm: false, isRain: false },
  80: { label: "Slight Rain Showers", icon: "🌦️", isStorm: false, isRain: true },
  81: { label: "Moderate Rain Showers", icon: "🌧️", isStorm: false, isRain: true },
  82: { label: "Violent Rain Showers", icon: "⛈️", isStorm: true, isRain: true },
  85: { label: "Slight Snow Showers", icon: "🌨️", isStorm: false, isRain: false },
  86: { label: "Heavy Snow Showers", icon: "🌨️", isStorm: true, isRain: false },
  95: { label: "Thunderstorm", icon: "⛈️", isStorm: true, isRain: true },
  96: { label: "Thunderstorm with Slight Hail", icon: "⛈️", isStorm: true, isRain: true },
  99: { label: "Severe Thunderstorm with Heavy Hail", icon: "🌩️", isStorm: true, isRain: true },
};

// In-memory cache for weather requests to prevent duplicate network calls
const WEATHER_CACHE = new Map();

/**
 * Resolve GPS coordinates for destination
 */
export async function resolveDestinationCoordinates(rawDestination = "") {
  const norm = normalizeDestinationName(rawDestination);
  // Pass returnFallback = false so unknown destinations don't falsely map to Kerala
  const localCenter = getDestinationCenter(norm, false);

  if (localCenter && localCenter.lat && localCenter.lng) {
    return {
      lat: localCenter.lat,
      lng: localCenter.lng,
      label: localCenter.label || rawDestination,
    };
  }

  // Clean rawDestination for external geocoding (strip newlines, "city in...", etc.)
  const primaryName = String(rawDestination)
    .split(/[\r\n]+/)[0]
    .replace(/\b(city|town|district|state)\s+in\s+.*$/gi, "")
    .replace(/[^\w\s,]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  const searchCandidates = Array.from(
    new Set([primaryName, norm, rawDestination.replace(/[\r\n]+/g, ", ").trim()].filter(Boolean))
  );

  for (const query of searchCandidates) {
    if (!query || query.length < 2) continue;
    try {
      const res = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          query
        )}&count=1&language=en&format=json`
      );
      if (res.ok) {
        const data = await res.json();
        if (data.results && data.results.length > 0) {
          const match = data.results[0];
          const resolved = {
            lat: match.latitude,
            lng: match.longitude,
            label: `${match.name}${match.admin1 ? `, ${match.admin1}` : ""}, ${match.country || ""}`,
          };
          setResolvedDestinationCoords(rawDestination, resolved);
          return resolved;
        }
      }
    } catch {
      // Continue to next candidate
    }
  }

  return { lat: 28.6139, lng: 77.2090, label: rawDestination || "India" };
}

/**
 * Fetch real-time & multi-day weather forecast from Open-Meteo
 */
export async function fetchDestinationWeather(rawDestination = "") {
  const norm = normalizeDestinationName(rawDestination);
  const cacheKey = `weather_${norm}`;

  const cached = WEATHER_CACHE.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < 15 * 60 * 1000) {
    return cached.data;
  }

  const coords = await resolveDestinationCoordinates(rawDestination);

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lng}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,wind_speed_10m,wind_gusts_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,rain_sum,precipitation_probability_max,wind_speed_10m_max,wind_gusts_10m_max&timezone=auto`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Weather service currently unavailable (HTTP ${response.status})`);
  }

  const data = await response.json();
  const result = {
    destination: rawDestination,
    normalizedDestination: norm,
    coords,
    current: data.current || {},
    daily: data.daily || {},
    timezone: data.timezone,
  };

  WEATHER_CACHE.set(cacheKey, { timestamp: Date.now(), data: result });
  return result;
}

/**
 * Evaluates weather conditions against natural disaster / hazard criteria
 * Returns professional safety verdict, hazard breakdowns, and recommendations
 */
export function evaluateWeatherSafety(weatherData, _tripDates = {}) {
  if (!weatherData) return null;


  const destination = weatherData.destination || "your destination";
  const normDest = (weatherData.normalizedDestination || destination).toLowerCase();

  const current = weatherData.current || {};
  const daily = weatherData.daily || {};

  // Check if destination is in a hilly / landslide-prone zone
  const isHillyTerrain = HILL_REGIONS.some(
    (h) => normDest.includes(h) || h.includes(normDest)
  );

  // Peak metrics across current + next 3 days
  const currentTemp = Math.round(current.temperature_2m ?? 28);
  const currentWindSpeed = Math.round(current.wind_speed_10m ?? 14);
  const currentGusts = Math.round(current.wind_gusts_10m ?? currentWindSpeed * 1.3);
  const currentRain = current.precipitation ?? 0;
  const currentWeatherCode = current.weather_code ?? 1;

  // Max forecast metrics for next 3-4 days
  const maxRainForecast = Math.max(...(daily.precipitation_sum?.slice(0, 4) || [currentRain]));
  const maxWindForecast = Math.max(...(daily.wind_speed_10m_max?.slice(0, 4) || [currentWindSpeed]));
  const maxGustsForecast = Math.max(...(daily.wind_gusts_10m_max?.slice(0, 4) || [currentGusts]));
  const peakWeatherCodes = daily.weather_code?.slice(0, 4) || [currentWeatherCode];

  const hasSevereStormCode = peakWeatherCodes.some((code) => [82, 86, 95, 96, 99].includes(code));
  const hasContinuousRain = (daily.precipitation_sum?.slice(0, 3) || []).filter((r) => r > 20).length >= 2;

  // Natural Hazard Evaluation
  const hazards = [];
  let safetyScore = 100; // 100 = Optimal safety, 0 = Extreme danger

  // 1. Wind Hazard Check
  if (maxGustsForecast >= 70 || maxWindForecast >= 50) {
    safetyScore -= 45;
    hazards.push({
      type: "WIND",
      severity: "DANGER",
      title: "Severe Gale & High Wind Warning",
      detail: `Peak wind gusts of ${maxGustsForecast} km/h (sustained ${maxWindForecast} km/h) forecasted. High danger of tree falls, structural disruption, and rough seas.`,
      icon: "💨",
    });
  } else if (maxGustsForecast >= 45 || maxWindForecast >= 35) {
    safetyScore -= 20;
    hazards.push({
      type: "WIND",
      severity: "CAUTION",
      title: "Gusty Wind Advisory",
      detail: `Noticeable wind gusts up to ${maxGustsForecast} km/h. Coastal boat trips and high viewpoints may experience temporary holds.`,
      icon: "💨",
    });
  }

  // 2. Rainfall & Flooding Hazard Check
  if (maxRainForecast >= 65) {
    safetyScore -= 50;
    hazards.push({
      type: "RAIN",
      severity: "DANGER",
      title: "Torrential Rainfall & Flash Flood Hazard",
      detail: `Extreme precipitation volume of ${maxRainForecast.toFixed(1)} mm forecasted. High likelihood of waterlogging, inundated transit corridors, and rapid runoff.`,
      icon: "🌧️",
    });
  } else if (maxRainForecast >= 30) {
    safetyScore -= 25;
    hazards.push({
      type: "RAIN",
      severity: "CAUTION",
      title: "Heavy Rainfall Advisory",
      detail: `Substantial rainfall (${maxRainForecast.toFixed(1)} mm) expected. Sightseeing will require full rain gear; expect traffic slowdowns.`,
      icon: "🌧️",
    });
  }

  // 3. Landslide & Mudslide Hazard Check
  if (isHillyTerrain && (maxRainForecast >= 40 || hasContinuousRain)) {
    safetyScore -= 35;
    hazards.push({
      type: "LANDSLIDE",
      severity: "DANGER",
      title: "Critical Landslide & Terrain Slip Hazard",
      detail: `Soil saturation in ${destination}'s mountain and ghat routes increases the danger of mudslides, rockfalls, and road blockages. Hilly transit not recommended.`,
      icon: "⛰️",
    });
  } else if (isHillyTerrain && maxRainForecast >= 20) {
    safetyScore -= 15;
    hazards.push({
      type: "LANDSLIDE",
      severity: "CAUTION",
      title: "Ghat Route Caution",
      detail: `Wet mountain passes and slippery bends in ${destination}. Exercise caution when navigating hill curves; avoid night driving.`,
      icon: "⛰️",
    });
  }

  // 4. Storm & Lightning Hazard Check
  if (hasSevereStormCode) {
    safetyScore -= 30;
    hazards.push({
      type: "STORM",
      severity: "DANGER",
      title: "Active Thunderstorm & Squall Activity",
      detail: "Intense electrical thunderstorms, lightning strikes, and squally winds detected in the meteorological pattern.",
      icon: "⚡",
    });
  }

  // Determine Verdict Status
  let status = "SAFE";
  let title = "";
  let professionalVerdict = "";
  let recommendation = "";

  if (safetyScore <= 50 || hazards.some((h) => h.severity === "DANGER")) {
    status = "DANGER";
    title = "Natural Hazard Warning: Hazardous Conditions Detected";
    professionalVerdict = `Comprehensive meteorological analysis for ${destination} indicates severe environmental risks, including ${hazards
      .map((h) => h.title.toLowerCase())
      .join(
        " and "
      )}. These factors compromise traveler safety and travel route viability.`;
    recommendation =
      "Travel is not recommended during this window. We strongly urge postponing non-essential outdoor travel or rescheduling excursions until regional disaster management agencies and meteorological authorities issue safety clearances.";
  } else if (safetyScore <= 80 || hazards.some((h) => h.severity === "CAUTION")) {
    status = "CAUTION";
    title = "Travel Advisory: Moderate Weather Conditions";
    professionalVerdict = `Weather patterns in ${destination} show moderate natural activity. While transportation corridors and key sights remain functional, outdoor itineraries and water-based activities may encounter interruptions.`;
    recommendation =
      "Travel with caution. Pack high-grade waterproof gear, reconfirm water excursion and boat cruise operations before arriving, and keep itinerary timing flexible.";
  } else {
    status = "SAFE";
    title = "Weather Safety Clearance: Favorable & Safe to Travel";
    professionalVerdict = `All meteorological indicators for ${destination} fall well within safe, calm parameters. Wind conditions are gentle (${currentWindSpeed} km/h) and precipitation is minimal (${maxRainForecast.toFixed(1)} mm). Transit routes, local excursions, and outdoor attractions are fully viable.`;
    recommendation =
      "Green light for your journey! The environment is calm and pleasant for travel. Have a wonderful, safe, and memorable trip!";
  }

  // Weather condition description
  const currentWeatherInfo = WMO_DESCRIPTIONS[currentWeatherCode] || {
    label: "Fair Weather",
    icon: "🌤️",
  };

  return {
    destination,
    status, // "SAFE" | "CAUTION" | "DANGER"
    title,
    professionalVerdict,
    recommendation,
    safetyScore: Math.max(0, safetyScore),
    hazards,
    metrics: {
      temperature: currentTemp,
      apparentTemperature: Math.round(current.apparent_temperature ?? currentTemp),
      windSpeedKmh: currentWindSpeed,
      windGustsKmh: maxGustsForecast,
      precipitationMm: maxRainForecast,
      condition: currentWeatherInfo.label,
      conditionIcon: currentWeatherInfo.icon,
      isHillyTerrain,
    },
    forecastDays: (daily.time || []).slice(0, 5).map((dateStr, idx) => ({
      date: dateStr,
      maxTemp: Math.round(daily.temperature_2m_max?.[idx] ?? 30),
      minTemp: Math.round(daily.temperature_2m_min?.[idx] ?? 22),
      rainSum: daily.precipitation_sum?.[idx] ?? 0,
      windMax: Math.round(daily.wind_speed_10m_max?.[idx] ?? 15),
      condition: WMO_DESCRIPTIONS[daily.weather_code?.[idx]]?.label || "Clear",
      icon: WMO_DESCRIPTIONS[daily.weather_code?.[idx]]?.icon || "🌤️",
    })),
    evaluatedAt: new Date().toISOString(),
  };
}

/**
 * Check whether a trip's start date is immediate (today/tomorrow) or within the 3-4 day safety window
 */
export function isTripWithinSafetyWindow(startDateStr) {
  if (!startDateStr) return true; // If no date provided, treat as immediate on-demand check
  const start = new Date(startDateStr);
  const now = new Date();

  // Strip hours for pure date comparison
  const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const diffMs = startDay.getTime() - today.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  // Within 0 to 4 days (or already ongoing, <= 4 days)
  return diffDays <= 4;
}
