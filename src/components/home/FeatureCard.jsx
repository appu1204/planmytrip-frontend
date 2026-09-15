export default function FeatureCard({ icon: Icon, iconBg, title, description }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-7 shadow-card">
      <div className={`mb-5 grid h-11 w-11 place-items-center rounded-xl ${iconBg}`}>
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="font-display text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-500">{description}</p>
    </div>
  );
}
