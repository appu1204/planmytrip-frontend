import Logo from "../ui/Logo";

/**
 * Left panel is a photo the user supplies (via `backgroundImage`) with a
 * brand-tinted gradient laid over it in CSS — no text is ever baked into
 * the photo itself. Every word you see (badge, headline, stats,
 * testimonial) is rendered here, so swapping the photo never breaks copy.
 */
export default function AuthLayout({
  backgroundImage,
  eyebrow,
  headline,
  headlineAccent,
  description,
  stats = [],
  testimonial,
  children,
}) {
  return (
    <div className="min-h-screen w-full bg-white lg:grid lg:grid-cols-2">
      {/* Image / brand panel */}
      <div className="relative hidden overflow-hidden lg:block">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
            backgroundColor: "var(--brand-dark)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(180deg, rgba(10,20,15,0.75) 0%, rgba(10,20,15,0.35) 35%, rgba(10,20,15,0.55) 75%, rgba(10,20,15,0.85) 100%)",
          }}
        />

        <div className="relative flex h-full flex-col justify-between p-12">
          <Logo variant="light" />

          <div className="max-w-md">
            {eyebrow && (
              <span className="mb-5 inline-block rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-white">
                {eyebrow}
              </span>
            )}
            <h1 className="font-display text-4xl font-semibold leading-[1.1] text-white">
              {headline}{" "}
              {headlineAccent && (
                <span className="italic" style={{ color: "var(--accent)" }}>
                  {headlineAccent}
                </span>
              )}
            </h1>
            {description && (
              <p className="mt-4 text-[15px] leading-relaxed text-white/80">{description}</p>
            )}

            {stats.length > 0 && (
              <div className="mt-8 flex gap-8">
                {stats.map((s) => (
                  <div key={s.label}>
                    <div className="font-display text-2xl font-semibold text-white">
                      {s.value}
                    </div>
                    <div className="text-xs leading-tight text-white/70">{s.label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {testimonial ? (
            <div className="rounded-2xl border border-white/10 bg-black/20 p-5 backdrop-blur-sm">
              <div className="mb-2 flex gap-0.5" style={{ color: "var(--accent)" }}>
                {"★★★★★".split("").map((s, i) => (
                  <span key={i}>{s}</span>
                ))}
              </div>
              <div className="flex gap-3">
                <div
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-xs font-semibold text-white"
                  style={{ backgroundColor: "var(--accent)" }}
                >
                  {testimonial.initials}
                </div>
                <p className="font-display text-sm italic leading-snug text-white/90">
                  "{testimonial.quote}"
                </p>
              </div>
            </div>
          ) : (
            <div />
          )}
        </div>
      </div>

      {/* Form panel */}
      <div className="flex min-h-screen items-center justify-center px-6 py-12 sm:px-10">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center justify-between lg:hidden">
            <Logo />
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
