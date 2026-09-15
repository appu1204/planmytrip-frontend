export default function CircleMember({ member }) {
  const fullName = member?.name || member?.fullName || member?.email || "Travel Circle Member";
  const role = member?.role || member?.relationship || member?.type || "Member";

  const initials = String(fullName)
    .split(" ")
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "TC";

  return (
    <div className="flex items-center gap-3">
      <span
        className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-xs font-semibold text-white"
        style={{ backgroundColor: "var(--accent)" }}
      >
        {initials}
      </span>
      <div>
        <div className="text-sm font-semibold text-slate-800">{fullName}</div>
        <div className="text-xs text-slate-400">{role}</div>
      </div>
    </div>
  );
}
