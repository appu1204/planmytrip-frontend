import { Link } from "react-router-dom";
import { Plane } from "lucide-react";

export default function Logo({ variant = "dark", size = "md", to = "/home" }) {
  const isLight = variant === "light";
  const sizes = {
    sm: "text-base",
    md: "text-lg",
    lg: "text-xl",
  };

  return (
    <Link to={to} className="inline-flex items-center" aria-label="Go to PlanMyTrip home">
      <div className={`flex items-center gap-2 ${sizes[size]} font-display font-semibold`}>
        <span
          className={`grid h-8 w-8 place-items-center rounded-lg ${
            isLight ? "bg-white/15 text-white" : "text-white"
          }`}
          style={!isLight ? { backgroundColor: "var(--brand)" } : undefined}
        >
          <Plane className="h-4 w-4" strokeWidth={2.25} />
        </span>
        <span className={isLight ? "text-white" : "text-slate-900"}>PlanMyTrip</span>
      </div>
    </Link>
  );
}
