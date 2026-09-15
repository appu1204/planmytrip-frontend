import { Link } from "react-router-dom";
import StatusBadge from "../trip/StatusBadge";
import { formatDateLabel } from "../../utils/format";

export default function RecentTripRow({ trip }) {
  const tripId = trip.id ?? trip.tripId;
  const travellers = (trip.adults || 0) + (trip.children || 0);
  return (
    <Link
      to={`/trips/${tripId}`} // opens the itinerary builder for this trip
      className="flex items-center justify-between gap-4 rounded-xl px-3 py-3 transition hover:bg-slate-50"
    >
      <div className="flex items-center gap-3">
        <span
          className="h-10 w-10 shrink-0 rounded-lg"
          style={{ backgroundImage: "linear-gradient(135deg, var(--brand-mid), var(--brand-dark))" }}
        />
        <div>
          <div className="text-sm font-semibold text-slate-800">{trip.name}</div>
          <div className="text-xs text-slate-400">
            {trip.checkIn && formatDateLabel(trip.checkIn)}
            {trip.checkOut && ` – ${formatDateLabel(trip.checkOut)}`}
            {travellers > 0 && ` · ${travellers} travellers`}
          </div>
        </div>
      </div>
      <StatusBadge status={trip.status} />
    </Link>
  );
}
