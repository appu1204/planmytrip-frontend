import { useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

function scorePassword(pwd = "") {
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  return score;
}

export default function PasswordInput({
  label,
  error,
  value,
  showStrength = false,
  className = "",
  labelClassName = "",
  leadingIcon: LeadingIcon,
  floatingLabel = false,
  ...props
}) {
  const generatedId = useId();
  const inputId = props.id || generatedId;
  const [visible, setVisible] = useState(false);
  const strength = showStrength ? scorePassword(value) : 0;

  return (
    <label className={`block ${floatingLabel ? "relative pt-2" : ""}`}>
      {label && (
        <span className={`${floatingLabel ? "absolute left-3 top-2 z-10 -translate-y-1/2 bg-white px-1.5 text-[11px] font-semibold text-slate-700" : "mb-1.5 block text-sm font-medium text-slate-800"} ${labelClassName}`}>
          {label}
        </span>
      )}
      <div className="relative">
        {LeadingIcon && <LeadingIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />}
        <input
          id={inputId}
          type={visible ? "text" : "password"}
          value={value}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={error ? `${inputId}-error` : undefined}
          className={`focus-ring w-full ${floatingLabel ? "rounded-[14px] border border-[#dce6f0] bg-[#fbfdff] px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100" : "rounded-xl border bg-white px-4 py-3 pr-11 text-[15px] text-slate-900 placeholder:text-slate-400 transition"} ${LeadingIcon ? "pl-10" : ""} pr-11 ${error ? "border-red-400" : floatingLabel ? "" : "border-slate-200 focus:border-transparent"} ${className}`}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-slate-400 hover:text-slate-600"
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {showStrength && value && (
        <div className="mt-2 flex gap-1.5">
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className={`h-1 flex-1 rounded-full ${
                i < strength ? "bg-[var(--brand)]" : "bg-slate-200"
              }`}
            />
          ))}
        </div>
      )}
      {error && <span id={`${inputId}-error`} role="alert" className="mt-1 block text-xs font-medium text-red-600">{error}</span>}
    </label>
  );
}
