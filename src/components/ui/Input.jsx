export default function Input({ label, error, className = "", ...props }) {
  return (
    <label className="block">
      {label && (
        <span className="mb-1.5 block text-sm font-medium text-slate-800">{label}</span>
      )}
      <input
        className={`focus-ring w-full rounded-xl border bg-white px-4 py-3 text-[15px] text-slate-900 placeholder:text-slate-400 transition
          ${error ? "border-red-400" : "border-slate-200 focus:border-transparent"} ${className}`}
        {...props}
      />
      {error && <span className="mt-1 block text-xs font-medium text-red-500">{error}</span>}
    </label>
  );
}
