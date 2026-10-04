import client from "./client";
import { FALLBACK_DESTINATIONS } from "../theme/destinationFallback";

const PERSONA_BACKEND_MAP = {
  family: "FAMILY",
  couple: "COUPLE",
  solo: "SOLO",
  friends: "FRIENDS",
  adventure: "ADVENTURE",
};

function normalizeDestination(d, index = 0) {
  if (!d) return null;
  const image = d.image || d.imageUrl || "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80";
  return {
    id: d.id || `dest_${index}`,
    name: d.name || "Curated Destination",
    country: d.country || "Global",
    image,
    imageUrl: image,
    rating: Number(d.rating) || 4.88,
    reviews: d.reviews || 840 + (index * 73) % 500,
    tag: d.tag || (d.persona ? `${d.persona} Pick` : "Popular"),
    priceFrom: d.priceFrom || "₹22,000",
    bestSeason: d.bestSeason || "Oct - Apr",
    duration: d.duration || "5-7 Days",
    highlights: Array.isArray(d.highlights) && d.highlights.length ? d.highlights : ["Scenic Views", "Curated Stays", "Verified Guides"],
    persona: d.persona || "ALL",
  };
}

async function requestWithFallback(primaryFn, fallbackFn) {
  try {
    const res = await primaryFn();
    const data = res?.data || res;
    const items = Array.isArray(data) ? data : data?.content || [];
    if (items.length > 0) return items.map(normalizeDestination);
    return null;
  } catch {
    if (fallbackFn) {
      try {
        const fbRes = await fallbackFn();
        const fbData = fbRes?.data || fbRes;
        const fbItems = Array.isArray(fbData) ? fbData : fbData?.content || [];
        if (fbItems.length > 0) return fbItems.map(normalizeDestination);
      } catch {
        // Fallback to local catalog
      }
    }
    return null;
  }
}

export const getPopularDestinations = async (personaKey, limit = 8) => {
  const personaParam = personaKey && personaKey !== "all" ? PERSONA_BACKEND_MAP[personaKey] || personaKey.toUpperCase() : undefined;
  const params = { limit };
  if (personaParam) params.persona = personaParam;

  const remote = await requestWithFallback(
    () => client.get("/api/trip/popular", { params }),
    () => client.get("/popular", { params })
  );

  if (remote && remote.length > 0) {
    return remote;
  }

  // Graceful local curated collection fallback
  const catalogKey = personaKey && FALLBACK_DESTINATIONS[personaKey] ? personaKey : "family";
  const localItems = FALLBACK_DESTINATIONS[catalogKey] || FALLBACK_DESTINATIONS.family || [];
  return localItems.slice(0, limit).map(normalizeDestination);
};