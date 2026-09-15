export default function DestinationPreviewCard({ destination }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-card">
      <h4 className="text-sm font-semibold text-slate-800">Destination preview</h4>
      <div
        className="relative mt-3 h-28 overflow-hidden rounded-xl"
        style={{ backgroundColor: "var(--brand-light)" }}
      >
        <svg viewBox="0 0 200 100" className="absolute inset-0 h-full w-full">
          <path
            d="M20 55 Q 70 20, 100 60 T 180 35"
            fill="none"
            stroke="var(--brand)"
            strokeWidth="2"
            strokeDasharray="4 5"
            opacity="0.6"
          />
          <circle cx="20" cy="55" r="5" fill="var(--brand)" />
          <circle cx="100" cy="60" r="5" fill="var(--brand)" />
          <circle cx="180" cy="35" r="6" fill="var(--accent)" />
        </svg>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-slate-500">
        {destination
          ? `We'll suggest a route once your itinerary for ${destination} is built.`
          : "Add a destination to see a route preview here."}
      </p>
    </div>
  );
}
