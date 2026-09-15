import { Home, Heart, UserRoundCog, Bell, Settings, LogOut } from "lucide-react";

export default function ProfileSidebarNav({ unreadCount, onNavigate, onOpenSettings, onSignOut }) {
  const items = [
    { icon: Home, label: "My trips", onClick: () => onNavigate("/trips") },
    { icon: Heart, label: "Wishlist", onClick: () => onNavigate("/wishlist") },
    { icon: UserRoundCog, label: "Change travel persona", onClick: () => onNavigate("/onboarding/persona") },
    { icon: Bell, label: "Notifications", badge: unreadCount, onClick: () => onOpenSettings("notifications") },
    { icon: Settings, label: "Settings", onClick: () => onOpenSettings("settings") },
  ];

  return (
    <div className="divide-y divide-slate-100 rounded-2xl border border-slate-100 bg-white shadow-card">
      {items.map((item) => (
        <button
          key={item.label}
          onClick={item.onClick}
          className="focus-ring flex w-full items-center justify-between px-5 py-4 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          <span className="flex items-center gap-3">
            <item.icon className="h-4 w-4 text-slate-400" /> {item.label}
          </span>
          {item.badge > 0 && (
            <span
              className="rounded-full px-2 py-0.5 text-xs font-semibold"
              style={{ backgroundColor: "var(--brand-light)", color: "var(--brand-dark)" }}
            >
              {item.badge} new
            </span>
          )}
        </button>
      ))}
      <button
        onClick={onSignOut} // clears the token/user from AuthContext and redirects to /login
        className="focus-ring flex w-full items-center gap-3 px-5 py-4 text-left text-sm font-medium text-red-500 transition hover:bg-red-50"
      >
        <LogOut className="h-4 w-4" /> Sign out
      </button>
    </div>
  );
}
