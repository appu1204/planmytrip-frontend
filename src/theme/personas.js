import { Shield, Heart, Users, Baby, Mountain } from "lucide-react";

// Single source of truth for persona-driven copy, icons and colors.
// Add a new persona here and every onboarding / home surface picks it up.
export const PERSONAS = {
  adventure: {
    key: "adventure",
    label: "Adventure",
    icon: Mountain,
    iconBg: "bg-lime-50 text-lime-700",
    tagline: "Adventure plan",
    description: "Curated treks, thrilling activities and off-the-grid trips for the bold.",
    home: {
      badge: "Adventure traveller mode",
      headlinePrefix: "Adventure is",
      headlineAccent: "out there!",
      subcopy: "Go further. Do more. Live fully.",
      sectionLabel: "for Adventure",
    },
  },
  solo: {
    key: "solo",
    label: "Solo",
    icon: Shield,
    iconBg: "bg-blue-50 text-blue-600",
    tagline: "Solo plan",
    description: "Independent, flexible trips built around exactly what you want.",
    home: {
      badge: "Solo traveller mode",
      headlinePrefix: "It's time for your",
      headlineAccent: "solo adventure",
      subcopy: "Discover new places. Find yourself.",
      sectionLabel: "for Solo Travellers",
    },
  },
  couple: {
    key: "couple",
    label: "Couple",
    icon: Heart,
    iconBg: "bg-pink-50 text-pink-600",
    tagline: "Couple plan",
    description: "Romantic getaways, sunset dinners and slower-paced escapes.",
    home: {
      badge: "Couple traveller mode",
      headlinePrefix: "Plan a getaway",
      headlineAccent: "built for two",
      subcopy: "Slower mornings. Better sunsets.",
      sectionLabel: "for Couples",
    },
  },
  friends: {
    key: "friends",
    label: "Friends",
    icon: Users,
    iconBg: "bg-violet-50 text-violet-600",
    tagline: "Friends plan",
    description: "Group deals, shared itineraries and adventures you'll never forget.",
    home: {
      badge: "Friends traveller mode",
      headlinePrefix: "Trips are better",
      headlineAccent: "with friends",
      subcopy: "Laugh louder. Explore together.",
      sectionLabel: "for Friends",
    },
  },
  family: {
    key: "family",
    label: "Family",
    icon: Baby,
    iconBg: "bg-emerald-50 text-emerald-600",
    tagline: "Family plan",
    description: "Safe, kid-friendly trips the whole household will actually enjoy.",
    home: {
      badge: "Family traveller mode",
      headlinePrefix: "Create beautiful",
      headlineAccent: "memories with family",
      subcopy: "Great places. Quality time. Unforgettable trips.",
      sectionLabel: "for Families",
    },
  },
};

export const PERSONA_LIST = Object.values(PERSONAS);

export const getPersona = (key) => PERSONAS[key] || PERSONAS.family;
