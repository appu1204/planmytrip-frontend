import { Plane, Building2, Compass, Car, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const ACTIONS = [
  { label: "Flights", icon: Plane, to: "/flights" },
  { label: "Hotels", icon: Building2, to: "/hotels" },
  { label: "Activities", icon: Compass, to: "/activities" },
  { label: "Transport", icon: Car, to: "/transport" },
  { label: "Plan with AI", icon: Sparkles, to: "/planner" },
];

export default function QuickActions() {
  return (
    <div className="flex gap-6">
      {ACTIONS.map(({ label, icon: Icon, to }) => (
        <Link key={label} to={to} className="flex flex-col items-center gap-2 text-white">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-white/15 backdrop-blur-sm transition hover:bg-white/25">
            <Icon className="h-5 w-5" />
          </span>
          <span className="text-xs font-medium text-white/90">{label}</span>
        </Link>
      ))}
    </div>
  );
}
