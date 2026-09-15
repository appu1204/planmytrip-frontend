import Logo from "../ui/Logo";

export default function AuthCard({ title, subtitle, children }) {
  return (
    <div
      className="flex min-h-screen items-center justify-center px-6 py-16"
      style={{
        backgroundImage: "linear-gradient(180deg, var(--brand-light), #ffffff)",
      }}
    >
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-8 shadow-card">
          <h1 className="font-display text-2xl font-semibold text-slate-900">{title}</h1>
          {subtitle && <p className="mt-2 text-sm text-slate-500">{subtitle}</p>}
          <div className="mt-7">{children}</div>
        </div>
      </div>
    </div>
  );
}
