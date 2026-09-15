import { useState } from "react";
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
  ...props
}) {
  const [visible, setVisible] = useState(false);
  const strength = showStrength ? scorePassword(value) : 0;

  return (
    <label className="block">
      {label && (
        <span className="mb-1.5 block text-sm font-medium text-slate-800">{label}</span>
      )}
      <div className="relative">
        <input
          type={visible ? "text" : "password"}
          value={value}
          className={`focus-ring w-full rounded-xl border bg-white px-4 py-3 pr-11 text-[15px] text-slate-900 placeholder:text-slate-400 transition
            ${error ? "border-red-400" : "border-slate-200 focus:border-transparent"}`}
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
      {error && <span className="mt-1 block text-xs font-medium text-red-500">{error}</span>}
    </label>
  );
}
