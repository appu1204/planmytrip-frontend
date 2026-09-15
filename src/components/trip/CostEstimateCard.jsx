import { formatINR } from "../../utils/format";

export default function CostEstimateCard({ estimate }) {
  const { stays, activities, transport, buffer, total, travellers, nights } = estimate;
  const hasData = nights > 0 && travellers > 0;

  return (
    <div
      className="rounded-2xl p-6 text-white"
      style={{ backgroundImage: "linear-gradient(160deg, var(--brand-dark), var(--brand))" }}
    >
      <span className="text-xs font-bold uppercase tracking-widest text-white/60">
        Estimated cost
      </span>
      <h3 className="mt-1 font-display text-lg font-semibold">
        {hasData ? `${travellers} travellers · ${nights} nights` : "Add dates & travellers"}
      </h3>

      {hasData ? (
        <div className="mt-4 space-y-2.5 text-sm">
          <Row label="Stays" value={stays} />
          <Row label="Activities & tours" value={activities} />
          <Row label="Transport" value={transport} />
          <Row label="Buffer (10%)" value={buffer} />
          <div className="mt-3 flex items-center justify-between border-t border-white/15 pt-3">
            <span className="font-semibold">Total estimate</span>
            <span className="font-display text-xl font-semibold">{formatINR(total)}</span>
          </div>
        </div>
      ) : (
        <p className="mt-3 text-sm text-white/70">
          A rough per-trip estimate will appear here once check-in, check-out, and traveller
          counts are set.
        </p>
      )}
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between text-white/85">
      <span>{label}</span>
      <span className="font-medium text-white">{formatINR(value)}</span>
    </div>
  );
}
