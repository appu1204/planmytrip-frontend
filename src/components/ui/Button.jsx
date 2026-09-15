import { Loader2 } from "lucide-react";

export default function Button({
  children,
  variant = "primary",
  loading = false,
  className = "",
  disabled,
  ...props
}) {
  const base =
    "focus-ring inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-[15px] font-semibold transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60";

  const variants = {
    primary: "text-white shadow-card",
    secondary: "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
    ghost: "text-slate-600 hover:bg-slate-100",
  };

  const style =
    variant === "primary"
      ? {
          backgroundImage: `linear-gradient(135deg, var(--brand-mid), var(--brand-dark))`,
        }
      : undefined;

  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      style={style}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}
