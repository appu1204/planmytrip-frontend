import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Share2, Pencil, X, Plus, Trash2, CheckCircle2, UserPlus } from "lucide-react";
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
import {
  updateCurrentUser,
  deleteCurrentUser,
  getTravelCircle,
  addTravelCircleMember,
  removeTravelCircleMember,
  getUserStats,
} from "../../api/users";
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
  const [panel, setPanel] = useState(null); // null | "notifications" | "settings" | "edit" | "circle"
  const [error, setError] = useState("");
  const [successNotice, setSuccessNotice] = useState("");

  const unreadCount = notifications.filter((n) => n.unread).length;

  useEffect(() => {
    let cancelled = false;

    listTrips({ userId: user?.id, page: 0, size: 5 })
      .then((data) => {
        if (!cancelled) setTrips(Array.isArray(data) ? data : data?.content || []);
      })
      .catch(() => {});

    getTravelCircle()
      .then((data) => {
        if (!cancelled) setCircle(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) setCircle([]);
      });

    getUserStats()
      .then((data) => {
        if (!cancelled && data) setStats(data);
      })
      .catch(() => {});

    listNotifications()
      .then((data) => {
        if (!cancelled) setNotifications(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) setNotifications([]);
      });

    getNotificationPreferences()
      .then((data) => {
        if (!cancelled && data) setPrefs(data);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const onShareProfile = async () => {
    const shareUrl = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${user?.fullName || "Traveler"}'s Profile on PlanMyTrip`,
          url: shareUrl,
        });
      } catch {
        // user dismissed share dialog
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      setSuccessNotice("Profile link copied to clipboard!");
      setTimeout(() => setSuccessNotice(""), 3000);
    }
  };

  const openNotifications = () => {
    setPanel("notifications");
    markAllNotificationsRead().catch(() => {});
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const togglePref = async (key) => {
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    try {
      await updateNotificationPreferences(next);
      setSuccessNotice("Preferences updated.");
      setTimeout(() => setSuccessNotice(""), 2000);
    } catch {
      // optimistic update maintained
    }
  };

  const onAddCircleMember = async (memberData) => {
    try {
      const created = await addTravelCircleMember(memberData);
      const newMember = created || { ...memberData, id: `circle-${Date.now()}` };
      setCircle((prev) => [...prev, newMember]);
      setPanel(null);
      setSuccessNotice(`Added ${memberData.name} to your travel circle!`);
      setTimeout(() => setSuccessNotice(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to add member to travel circle.");
    }
  };

  const onRemoveCircleMember = async (memberId) => {
    try {
      await removeTravelCircleMember(memberId);
      setCircle((prev) => prev.filter((m) => m.id !== memberId));
      setSuccessNotice("Member removed from travel circle.");
      setTimeout(() => setSuccessNotice(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to remove member.");
    }
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

  const userName = user?.fullName || user?.name || user?.email?.split("@")[0] || "Traveler";
  const initials = userName
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen bg-[#f6f5f1]">
      <Navbar user={user} />

      <main className="mx-auto max-w-5xl px-6 py-10">
        {successNotice && (
          <div className="mb-6 flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-800">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>{successNotice}</span>
          </div>
        )}

        {error && (
          <div className="mb-6 flex items-center justify-between rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            <span>{error}</span>
            <button onClick={() => setError("")} className="text-xs font-bold hover:underline">
              Dismiss
            </button>
          </div>
        )}

        {/* Header card */}
        <div
          className="flex flex-col gap-6 rounded-2xl p-7 text-white sm:flex-row sm:items-center sm:justify-between shadow-card"
          style={{ backgroundImage: "linear-gradient(160deg, var(--brand-dark), var(--brand))" }}
        >
          <div className="flex items-center gap-4">
            <span
              className="grid h-16 w-16 shrink-0 place-items-center rounded-full text-xl font-bold text-white shadow-inner"
              style={{ backgroundColor: "var(--accent)" }}
            >
              {initials}
            </span>
            <div>
              <h1 className="font-display text-2xl font-semibold">{userName}</h1>
              <p className="text-sm text-white/70">{user?.email}</p>
              <div className="mt-2">
                <Badge>{persona.label} traveller</Badge>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onShareProfile}
              className="focus-ring flex items-center gap-2 rounded-xl border border-white/25 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/10 transition"
            >
              <Share2 className="h-4 w-4" /> Share profile
            </button>
            <button
              onClick={() => setPanel("edit")}
              className="focus-ring flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:opacity-95 transition"
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
            onOpenNotifications={openNotifications}
            onSignOut={onSignOut}
          />

          <div className="space-y-6">
            <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-card">
              <h2 className="mb-3 font-display text-lg font-semibold text-slate-900">Recent trips</h2>
              {trips.length === 0 ? (
                <div className="py-6 text-center text-sm text-slate-400">
                  <p>No trips yet — start planning your first journey.</p>
                  <Button onClick={() => navigate("/trips/new")} className="mt-3 w-auto mx-auto px-4">
                    + Create a trip
                  </Button>
                </div>
              ) : (
                <div className="space-y-1">
                  {trips.map((t) => (
                    <RecentTripRow key={t.id ?? t.tripId} trip={t} />
                  ))}
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-card">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-display text-lg font-semibold text-slate-900">
                  Travel circle · {circle.length} {circle.length === 1 ? "member" : "members"}
                </h2>
                <button
                  onClick={() => setPanel("circle")}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-dashed border-emerald-600/40 bg-emerald-50/60 px-3 py-1.5 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Member
                </button>
              </div>

              {circle.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-500">
                  <p>No companion travel members added yet.</p>
                  <p className="mt-1 text-slate-400">Add friends, family, or travel buddies to share itineraries easily.</p>
                  <button
                    onClick={() => setPanel("circle")}
                    className="mt-3 font-semibold text-emerald-700 hover:underline"
                  >
                    + Add your first travel partner
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {circle.map((m) => (
                    <div key={m.id} className="relative group">
                      <CircleMember member={m} />
                      <button
                        onClick={() => onRemoveCircleMember(m.id)}
                        className="absolute right-2 top-2 p-1.5 text-slate-300 opacity-0 group-hover:opacity-100 hover:text-red-600 transition"
                        title="Remove member"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </main>

      {/* Notifications Panel */}
      {panel === "notifications" && (
        <SidePanel title="Notifications" onClose={() => setPanel(null)}>
          {notifications.length === 0 ? (
            <div className="rounded-xl border border-slate-100 p-6 text-center text-sm font-medium text-slate-500">
              No notifications right now. We’ll notify you of travel alerts, trip clearance, and updates here.
            </div>
          ) : (
            notifications.map((n) => (
              <div key={n.id} className="rounded-xl border border-slate-100 p-4 hover:bg-slate-50 transition">
                <div className="text-sm font-semibold text-slate-900">{n.title}</div>
                <p className="mt-1 text-xs text-slate-500">{n.body || n.message}</p>
              </div>
            ))
          )}
        </SidePanel>
      )}

      {/* Settings Panel */}
      {panel === "settings" && (
        <SidePanel title="Settings" onClose={() => setPanel(null)}>
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-800">Notification Channels</h3>
            {[
              { key: "email", label: "Email updates & itineraries" },
              { key: "push", label: "Push notifications" },
              { key: "tripReminders", label: "Trip weather & clearance alerts" },
            ].map((row) => (
              <label
                key={row.key}
                className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3 hover:bg-slate-50 transition cursor-pointer"
              >
                <span className="text-sm text-slate-700">{row.label}</span>
                <input
                  type="checkbox"
                  checked={Boolean(prefs[row.key])}
                  onChange={() => togglePref(row.key)}
                  className="h-4 w-4 rounded accent-[var(--brand)] cursor-pointer"
                />
              </label>
            ))}
          </div>

          <div className="mt-6 rounded-xl border border-red-100 bg-red-50 p-4">
            <h3 className="text-sm font-semibold text-red-600">Danger zone</h3>
            <p className="mt-1 text-xs text-red-500">
              Permanently delete your account, trips, and saved itineraries.
            </p>
            <button
              onClick={onDeleteAccount}
              className="focus-ring mt-3 rounded-lg border border-red-200 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-100 transition"
            >
              Delete account
            </button>
          </div>
        </SidePanel>
      )}

      {/* Edit Profile Panel */}
      {panel === "edit" && (
        <SidePanel title="Edit profile" onClose={() => setPanel(null)}>
          <EditProfileForm
            user={user}
            onSave={async (patch) => {
              try {
                const updated = await updateCurrentUser(patch);
                updateUser(updated || patch);
                setPanel(null);
                setSuccessNotice("Profile updated successfully!");
                setTimeout(() => setSuccessNotice(""), 3000);
              } catch (err) {
                setError(err.message);
              }
            }}
          />
        </SidePanel>
      )}

      {/* Add Circle Member Panel */}
      {panel === "circle" && (
        <SidePanel title="Add to Travel Circle" onClose={() => setPanel(null)}>
          <AddCircleMemberForm onAdd={onAddCircleMember} onCancel={() => setPanel(null)} />
        </SidePanel>
      )}
    </div>
  );
}

function SidePanel({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs" onClick={onClose}>
      <div
        className="h-full w-full max-w-sm space-y-4 overflow-y-auto bg-white p-6 shadow-panel"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
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
  const [fullName, setFullName] = useState(user?.fullName || user?.name || "");
  const [email, setEmail] = useState(user?.email || "");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave({ fullName, email });
      }}
      className="space-y-4"
    >
      <Input
        label="Full name"
        required
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
      />
      <Input
        label="Email address"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Button type="submit">Save changes</Button>
    </form>
  );
}

function AddCircleMemberForm({ onAdd, onCancel }) {
  const [name, setName] = useState("");
  const [relationship, setRelationship] = useState("Friend");
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd({ name: name.trim(), relationship, email: email.trim() });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Companion's Name"
        placeholder="e.g. Alex Johnson"
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
          Relationship
        </label>
        <select
          value={relationship}
          onChange={(e) => setRelationship(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
        >
          <option value="Friend">Friend</option>
          <option value="Partner / Spouse">Partner / Spouse</option>
          <option value="Family Member">Family Member</option>
          <option value="Colleague">Colleague</option>
        </select>
      </div>
      <Input
        label="Email Address (optional)"
        type="email"
        placeholder="alex@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <div className="flex gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel} className="w-auto px-4">
          Cancel
        </Button>
        <Button type="submit" className="w-auto px-5">
          <UserPlus className="h-4 w-4" /> Add to Circle
        </Button>
      </div>
    </form>
  );
}
