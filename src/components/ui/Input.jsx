import { useId } from "react";

export default function Input({
  label,
  error,
  className = "",
  labelClassName = "",
  leadingIcon: LeadingIcon,
  floatingLabel = false,
  ...props
}) {
  const generatedId = useId();
  const inputId = props.id || generatedId;

  return (
    <label className={`block ${floatingLabel ? "relative pt-2" : ""}`}>
      {label && (
        <span className={`${floatingLabel ? "absolute left-3 top-2 z-10 -translate-y-1/2 bg-white px-1.5 text-[11px] font-semibold text-slate-700" : "mb-1.5 block text-sm font-medium text-slate-800"} ${labelClassName}`}>
          {label}
        </span>
      )}
      <span className="relative block">
        {LeadingIcon && <LeadingIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />}
        <input
          id={inputId}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={error ? `${inputId}-error` : undefined}
          className={`focus-ring w-full ${floatingLabel ? "rounded-[14px] border border-[#dce6f0] bg-[#fbfdff] px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100" : "rounded-xl border bg-white px-4 py-3 text-[15px] text-slate-900 placeholder:text-slate-400 transition"} ${LeadingIcon ? "pl-10" : ""} ${error ? "border-red-400" : floatingLabel ? "" : "border-slate-200 focus:border-transparent"} ${className}`}
          {...props}
        />
      </span>
      {error && <span id={`${inputId}-error`} role="alert" className="mt-1 block text-xs font-medium text-red-600">{error}</span>}
    </label>
  );
}
