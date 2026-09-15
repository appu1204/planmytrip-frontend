const STATUS_STYLES = {
  DRAFT: "bg-slate-100 text-slate-600",
  PLANNED: "bg-amber-50 text-amber-700",
  UPCOMING: "bg-amber-50 text-amber-700",
  ONGOING: "bg-blue-50 text-blue-700",
  COMPLETED: "bg-emerald-50 text-emerald-700",
  CANCELLED: "bg-red-50 text-red-600",
};

export default function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || "bg-slate-100 text-slate-600";
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${style}`}>
      {status?.charAt(0) + status?.slice(1).toLowerCase()}
    </span>
  );
}
