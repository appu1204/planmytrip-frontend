import { Plane, Building2, Compass, Car, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const ACTIONS = [
  { label: "Flights", icon: Plane, to: "/flights", badge: "Live deals" },
  { label: "Hotels", icon: Building2, to: "/hotels", badge: "Verified" },
  { label: "Activities", icon: Compass, to: "/activities" },
  { label: "Transport", icon: Car, to: "/transport" },
  { label: "AI Planner", icon: Sparkles, to: "/planner", featured: true },
];

export default function QuickActions() {
  return (
    <div className="flex w-full items-center gap-3 overflow-x-auto no-scrollbar pb-1 pt-0.5 sm:gap-5">
      {ACTIONS.map(({ label, icon: Icon, to, badge, featured }) => (
        <Link
          key={label}
          to={to}
          className="group flex shrink-0 flex-col items-center gap-2 text-white transition focus:outline-none"
        >
          <div
            className={`relative grid h-12 w-12 place-items-center rounded-2xl backdrop-blur-md transition-all duration-200 group-hover:-translate-y-1 group-hover:shadow-lg sm:h-13 sm:w-13 ${
              featured
                ? "border border-amber-300/40 bg-gradient-to-tr from-amber-500/25 to-emerald-500/25 text-amber-300 group-hover:border-amber-300/80"
                : "border border-white/20 bg-white/10 text-white group-hover:bg-white/20"
            }`}
          >
            <Icon className="h-5 w-5" />
            {badge && (
              <span className="absolute -top-1.5 -right-1.5 rounded-full bg-emerald-500 px-1.5 py-0.2 text-[9px] font-bold text-white shadow-sm sm:block hidden">
                {badge}
              </span>
            )}
          </div>
          <span className="text-xs font-medium text-white/90 group-hover:text-white">
            {label}
          </span>
        </Link>
      ))}
    </div>
  );
}

