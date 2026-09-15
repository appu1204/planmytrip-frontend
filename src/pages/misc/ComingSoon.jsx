import { useState } from "react";
import { CircleCheck, Mail, Sparkles } from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import { useAuth } from "../../context/AuthContext";
import { getPersona } from "../../theme/personas";
import { COMING_SOON_CONTENT } from "../../theme/comingSoonContent";

// Drop an MP4 at public/videos/coming-soon-<type>.mp4 (e.g.
// coming-soon-flights.mp4) and it plays full-bleed behind this page
// automatically — muted, looping, no controls. Until a file exists (or
// on a connection too slow to load it), onError swaps in an animated
// gradient so the section never looks broken.
export default function ComingSoon({ type }) {
  const { user } = useAuth();
  const persona = getPersona(user?.persona);
  const content = COMING_SOON_CONTENT[type];
  const Icon = content.icon;

  const [videoFailed, setVideoFailed] = useState(false);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const onNotifyMe = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    // There's no "notify me when a feature ships" endpoint in the
    // backlog yet — this is an honest local confirmation, not a real
    // subscription. Wire it to a real capture endpoint when one exists.
    setSubscribed(true);
  };

  return (
    <div className="min-h-screen bg-[#0a1410]">
      <Navbar user={user} transparent />

      <div className="relative flex min-h-screen flex-col overflow-hidden">
        {/* Background layer: real video if present, animated gradient otherwise */}
        <div className="absolute inset-0">
          {!videoFailed ? (
            <video
              className="h-full w-full object-cover"
              src={`/videos/coming-soon-${content.key}.mp4`}
              autoPlay
              muted
              loop
              playsInline
              onError={() => setVideoFailed(true)}
            />
          ) : (
            <div
              className="h-full w-full"
              style={{ backgroundImage: "linear-gradient(160deg, var(--brand-dark), #06100c)" }}
            >
              <div
                className="absolute -left-24 top-16 h-96 w-96 animate-float-a rounded-full opacity-30 blur-3xl"
                style={{ backgroundColor: "var(--brand-mid)" }}
              />
              <div
                className="absolute -right-24 bottom-10 h-[28rem] w-[28rem] animate-float-b rounded-full opacity-25 blur-3xl"
                style={{ backgroundColor: "var(--accent)" }}
              />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#06100c] via-[#06100c]/70 to-[#06100c]/30" />
        </div>

        {/* Content layer */}
        <main className="relative z-10 mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-6 py-24 text-center">
          <span
            className="grid h-16 w-16 place-items-center rounded-2xl border border-white/15 bg-white/10 backdrop-blur-sm"
          >
            <Icon className="h-7 w-7 text-white" />
          </span>

          <span className="mt-6 text-xs font-semibold uppercase tracking-widest text-white/50">
            {content.eyebrow}
          </span>

          <h1 className="mt-4 font-display text-4xl font-semibold leading-tight text-white sm:text-5xl">
            Hold tight — {content.title.charAt(0).toLowerCase() + content.title.slice(1)}
          </h1>

          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-white/70">{content.subcopy}</p>

          <ul className="mt-8 grid w-full max-w-md gap-3 text-left">
            {content.checklist.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-white/80">
                <CircleCheck className="mt-0.5 h-4 w-4 shrink-0" style={{ color: "var(--accent)" }} />
                {item}
              </li>
            ))}
          </ul>

          {subscribed ? (
            <div className="mt-8 flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-medium text-white backdrop-blur-sm">
              <Sparkles className="h-4 w-4" style={{ color: "var(--accent)" }} />
              We'll let you know the moment {content.eyebrow.split("·")[1]?.trim().toLowerCase() || "this"} is live.
            </div>
          ) : (
            <form
              onSubmit={onNotifyMe}
              className="mt-8 flex w-full max-w-md flex-col gap-2.5 rounded-2xl border border-white/15 bg-white/10 p-2 backdrop-blur-sm sm:flex-row"
            >
              <label className="flex flex-1 items-center gap-2.5 px-3 py-2">
                <Mail className="h-4 w-4 shrink-0 text-white/50" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  className="w-full bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none"
                />
              </label>
              <button
                type="submit"
                className="focus-ring shrink-0 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
                style={{ backgroundColor: "var(--accent)" }}
              >
                Notify me
              </button>
            </form>
          )}

          <p className="mt-6 text-xs text-white/40">
            Built for {persona.label.toLowerCase()} travellers, like the rest of PlanMyTrip.
          </p>
        </main>
      </div>
    </div>
  );
}
