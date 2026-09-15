export default function Badge({ children, icon: Icon, className = "" }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold ${className}`}
      style={{ backgroundColor: "var(--brand-light)", color: "var(--brand-dark)" }}
    >
      {Icon && <Icon className="h-3.5 w-3.5" />}
      {children}
    </span>
  );
}
