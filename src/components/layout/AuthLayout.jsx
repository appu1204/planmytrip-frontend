import { CalendarDays, Check, MapPinned, UsersRound } from "lucide-react";
import Logo from "../ui/Logo";
import SocialButton from "../ui/SocialButton";

export default function AuthLayout({
  backgroundImage = "/images/hero-family.jpg",
  mode,
  eyebrow,
  headline,
  headlineSecondLine,
  headlineAccent,
  description,
  highlights = [],
  children,
}) {
  const supportingQuote = mode === "login"
    ? "Your next story starts right where you left off."
    : "The best trips leave room for the unexpected.";

  return (
    <main className="min-h-svh bg-[#f8faf8] lg:grid lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
      <section className="relative isolate flex min-h-[230px] flex-col overflow-hidden bg-[#08271e] px-5 py-4 sm:min-h-[390px] sm:px-10 sm:py-8 lg:z-20 lg:min-h-svh lg:border-r lg:border-white/20 lg:px-12 lg:py-10 lg:shadow-[18px_0_56px_rgba(6,34,27,.22)] xl:px-16">
        <div aria-hidden="true" className="absolute inset-0 -z-10 overflow-hidden">
          <div
            className="absolute inset-0 scale-[1.05] bg-cover bg-[position:68%_center]"
            style={{
              backgroundImage: `url("${backgroundImage}"), linear-gradient(145deg, #43876d, #0a2e1a)`,
              filter: "blur(2px) brightness(.52) saturate(.82)",
            }}
          />
          <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(4,30,23,.77)_0%,rgba(7,40,30,.52)_55%,rgba(5,25,22,.66)_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(4,22,18,.72),transparent_58%)]" />
          <div className="absolute inset-y-0 right-0 hidden w-14 bg-gradient-to-r from-transparent to-[#f8faf8]/25 lg:block" />
        </div>

        <Logo variant="light" size="sm" />

        <div className="auth-story-enter my-auto max-w-xl py-4 sm:py-10 lg:py-12">
          {eyebrow && (
            <p className="mb-4 inline-flex rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-[10px] font-semibold uppercase text-white/90 sm:text-xs">
              {eyebrow}
            </p>
          )}
          <h1 className="max-w-lg font-display text-[34px] font-semibold leading-[1.08] text-white sm:text-[42px] lg:text-[48px]">
            {headline}
            {headlineSecondLine && <><br />{headlineSecondLine}{" "}</>}
            {headlineAccent && (
              <span className="font-display font-medium italic text-[#f2a06b]">
                {headlineAccent}
              </span>
            )}
          </h1>
          {description && (
            <p className="mt-4 hidden max-w-md text-sm leading-6 text-white/85 sm:block sm:text-base sm:leading-7">
              {description}
            </p>
          )}

          {highlights.length > 0 && (
            <ul className="mt-6 hidden space-y-3 sm:block lg:mt-7">
              {highlights.map((highlight) => (
                <li key={highlight} className="flex items-center gap-3 text-sm text-white/90">
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full border border-white/30 bg-white/10">
                    <Check className="h-3 w-3" aria-hidden="true" />
                  </span>
                  {highlight}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mb-1 hidden max-w-xl rounded-2xl border border-white/15 bg-[#08271e]/45 p-4 backdrop-blur-md sm:block lg:mt-auto">
          <p className="text-xs font-semibold uppercase text-white/65">A better way to travel together</p>
          <p className="mt-1 font-display text-lg font-medium italic text-white">{supportingQuote}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {[
              [MapPinned, "Places"],
              [CalendarDays, "Day plans"],
              [UsersRound, "Travel crew"],
            ].map(([Icon, label]) => (
              <span key={label} className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-2.5 py-1.5 text-xs text-white/85">
                <Icon className="h-3.5 w-3.5 text-[#f2a06b]" aria-hidden="true" />
                {label}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 -mt-5 flex justify-center rounded-t-[26px] bg-[radial-gradient(ellipse_at_top_right,rgba(225,242,231,.5),transparent_42%),radial-gradient(ellipse_at_bottom_left,rgba(253,239,222,.42),transparent_38%),#f7faf8] px-5 py-8 sm:mx-8 sm:rounded-[26px] sm:px-8 sm:py-10 lg:mx-0 lg:mt-0 lg:min-h-svh lg:items-center lg:rounded-none lg:px-8 lg:py-10 xl:px-14">
        <div className="auth-panel-enter w-full max-w-[600px] rounded-[30px] border border-white/85 bg-white/80 px-5 py-6 shadow-[0_28px_90px_rgba(17,51,40,.18)] backdrop-blur-2xl sm:px-8 sm:py-7 lg:px-10 lg:py-8 xl:px-12">
          <div className="mx-auto w-full max-w-[470px]">
          <div className="mb-3 flex gap-2 sm:gap-3">
            <SocialButton provider="google" label="Google" disabled descriptionId="social-signin-status" />
            <SocialButton provider="apple" label="Apple" disabled descriptionId="social-signin-status" />
            <SocialButton provider="facebook" label="Facebook" disabled descriptionId="social-signin-status" />
          </div>
          <p id="social-signin-status" className="sr-only">Provider sign-in will be available once connected.</p>
          <div className="mb-4 flex items-center gap-3 text-[11px] text-slate-400">
            <span className="h-px flex-1 bg-slate-200" />
            <span>or use your email</span>
            <span className="h-px flex-1 bg-slate-200" />
          </div>
          {children}
          </div>
        </div>
      </section>
    </main>
  );
}