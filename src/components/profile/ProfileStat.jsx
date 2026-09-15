export default function ProfileStat({ value, label }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 text-center shadow-card">
      <div className="font-display text-3xl font-semibold text-slate-900">{value}</div>
      <div className="mt-1 text-sm text-slate-500">{label}</div>
    </div>
  );
}
