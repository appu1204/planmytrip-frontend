import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Share2, Pencil, X } from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Badge from "../../components/ui/Badge";
import ProfileStat from "../../components/profile/ProfileStat";
import ProfileSidebarNav from "../../components/profile/ProfileSidebarNav";
import RecentTripRow from "../../components/profile/RecentTripRow";
import CircleMember from "../../components/profile/CircleMember";
import { useAuth } from "../../context/AuthContext";
import { getPersona } from "../../theme/personas";
import { listTrips } from "../../api/trips";
import { updateCurrentUser, deleteCurrentUser, getTravelCircle, getUserStats } from "../../api/users";
import {
  listNotifications,
  markAllNotificationsRead,
  getNotificationPreferences,
  updateNotificationPreferences,
} from "../../api/notifications";

const DEFAULT_STATS = { tripsPlanned: 0, wishlisted: 0, completed: 0 };
const DEFAULT_PREFS = { email: true, push: true, tripReminders: true };

export default function Profile() {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const persona = getPersona(user?.persona);

  const [trips, setTrips] = useState([]);
  const [circle, setCircle] = useState([]);
  const [stats, setStats] = useState(DEFAULT_STATS);
  const [notifications, setNotifications] = useState([]);
  const [prefs, setPrefs] = useState(DEFAULT_PREFS);
  const [panel, setPanel] = useState(null); // null | "notifications" | "settings" | "edit"
  const [error, setError] = useState("");

  const unreadCount = notifications.filter((n) => n.unread).length;

  // Pull everything the page needs independently and keep the travel
  // circle empty by default when the user does not provide any members.
  useEffect(() => {
    listTrips({ userId: user?.id, page: 0, size: 5 })
      .then((data) => setTrips(Array.isArray(data) ? data : data?.content || []))
      .catch(() => {});

    getTravelCircle()
      .then((data) => setCircle(Array.isArray(data) ? data : []))
      .catch(() => setCircle([]));

    getUserStats()
      .then((data) => data && setStats(data))
      .catch(() => {});

    listNotifications()
      .then((data) => {
        setNotifications(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        setNotifications([]);
      });

    getNotificationPreferences()
      .then((data) => data && setPrefs(data))
      .catch(() => {});
  }, [user?.id]);

  const openNotifications = () => {
    setPanel("notifications");
    markAllNotificationsRead().catch(() => {});
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const togglePref = (key) => {
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    updateNotificationPreferences(next).catch(() => {});
  };

  const onSignOut = () => {
    logout();
    navigate("/login");
  };

  const onDeleteAccount = async () => {
    if (!window.confirm("Delete your PlanMyTrip account? This can't be undone.")) return;
    try {
      await deleteCurrentUser();
      logout();
      navigate("/register");
    } catch (err) {
      setError(err.message);
    }
  };

  const initials = (user?.fullName || "PlanMyTrip Demo")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen bg-[#f6f5f1]">
      <Navbar user={user} />

      <main className="mx-auto max-w-5xl px-6 py-10">
        {error && (
          <div className="mb-6 rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</div>
        )}

        {/* Header card */}
        <div
          className="flex flex-col gap-6 rounded-2xl p-7 text-white sm:flex-row sm:items-center sm:justify-between"
          style={{ backgroundImage: "linear-gradient(160deg, var(--brand-dark), var(--brand))" }}
        >
          <div className="flex items-center gap-4">
            <span
              className="grid h-16 w-16 shrink-0 place-items-center rounded-full text-xl font-semibold text-white"
              style={{ backgroundColor: "var(--accent)" }}
            >
              {initials}
            </span>
            <div>
              <h1 className="font-display text-2xl font-semibold">{user?.fullName || "PlanMyTrip Demo"}</h1>
              <p className="text-sm text-white/70">{user?.email}</p>
              <div className="mt-2">
                <Badge>{persona.label} traveller</Badge>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="focus-ring flex items-center gap-2 rounded-xl border border-white/25 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/10">
              <Share2 className="h-4 w-4" /> Share profile
            </button>
            <button
              onClick={() => setPanel("edit")}
              className="focus-ring flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white"
              style={{ backgroundColor: "var(--accent)" }}
            >
              <Pencil className="h-4 w-4" /> Edit profile
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          <ProfileStat value={stats.tripsPlanned} label="Trips planned" />
          <ProfileStat value={stats.wishlisted} label="Wishlisted" />
          <ProfileStat value={stats.completed} label="Completed" />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
          <ProfileSidebarNav
            unreadCount={unreadCount}
            onNavigate={navigate}
            onOpenSettings={setPanel}
            onSignOut={onSignOut}
          />

          <div className="space-y-6">
            <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-card">
              <h2 className="mb-3 font-display text-lg font-semibold text-slate-900">Recent trips</h2>
              {trips.length === 0 ? (
                <p className="text-sm text-slate-400">No trips yet — start planning your first one.</p>
              ) : (
                <div className="space-y-1">
                  {trips.map((t) => (
                    <RecentTripRow key={t.id ?? t.tripId} trip={t} />
                  ))}
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-card">
              <h2 className="mb-4 font-display text-lg font-semibold text-slate-900">
                Travel circle · {circle.length} members
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {circle.map((m) => (
                  <CircleMember key={m.id} member={m} />
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>

      {panel === "notifications" && (
        <SidePanel title="Notifications" onClose={() => setPanel(null)}>
          {notifications.length === 0 ? (
            <div className="rounded-xl border border-slate-100 p-4">
              <p className="text-sm font-medium text-slate-600">No notifications yet. We’ll keep you updated with your latest travel activity here.</p>
            </div>
          ) : (
            notifications.map((n) => (
              <div key={n.id} className="rounded-xl border border-slate-100 p-4">
                <div className="text-sm font-semibold text-slate-800">{n.title}</div>
                <p className="mt-1 text-sm text-slate-500">{n.body}</p>
              </div>
            ))
          )}
        </SidePanel>
      )}

      {panel === "settings" && (
        <SidePanel title="Settings" onClose={() => setPanel(null)}>
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-800">Notifications</h3>
            {[
              { key: "email", label: "Email updates" },
              { key: "push", label: "Push notifications" },
              { key: "tripReminders", label: "Trip reminders" },
            ].map((row) => (
              <label key={row.key} className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3">
                <span className="text-sm text-slate-700">{row.label}</span>
                <input
                  type="checkbox"
                  checked={Boolean(prefs[row.key])}
                  onChange={() => togglePref(row.key)}
                  className="h-4 w-4 accent-[var(--brand)]"
                />
              </label>
            ))}
          </div>
          <div className="mt-6 rounded-xl border border-red-100 bg-red-50 p-4">
            <h3 className="text-sm font-semibold text-red-600">Danger zone</h3>
            <p className="mt-1 text-xs text-red-500">Deleting your account removes all trips and saved data.</p>
            <button
              onClick={onDeleteAccount}
              className="focus-ring mt-3 rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-100"
            >
              Delete account
            </button>
          </div>
        </SidePanel>
      )}

      {panel === "edit" && (
        <SidePanel title="Edit profile" onClose={() => setPanel(null)}>
          <EditProfileForm
            user={user}
            onSave={async (patch) => {
              try {
                const updated = await updateCurrentUser(patch);
                updateUser(updated || patch);
                setPanel(null);
              } catch (err) {
                setError(err.message);
              }
            }}
          />
        </SidePanel>
      )}
    </div>
  );
}

function SidePanel({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-30 flex justify-end bg-black/30" onClick={onClose}>
      <div
        className="h-full w-full max-w-sm space-y-4 overflow-y-auto bg-white p-6 shadow-panel"
        onClick={(e) => e.stopPropagation()} // don't close when clicking inside the panel
      >
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-slate-900">{title}</h2>
          <button onClick={onClose} className="focus-ring rounded-full p-1.5 text-slate-400 hover:bg-slate-100">
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function EditProfileForm({ user, onSave }) {
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [email, setEmail] = useState(user?.email || "");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave({ fullName, email });
      }}
      className="space-y-4"
    >
      <Input label="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
      <Input label="Email address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <Button type="submit">Save changes</Button>
    </form>
  );
}
