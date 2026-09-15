export default function TrustBadge({ icon: Icon, title, subtitle }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="grid h-10 w-10 shrink-0 place-items-center rounded-full"
        style={{ backgroundColor: "var(--brand-light)", color: "var(--brand)" }}
      >
        <Icon className="h-4.5 w-4.5" />
      </div>
      <div>
        <div className="text-sm font-semibold text-slate-800">{title}</div>
        <div className="text-xs text-slate-500">{subtitle}</div>
      </div>
    </div>
  );
}
