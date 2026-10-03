const ICONS = {
  google: (
    <svg viewBox="0 0 24 24" className="h-4 w-4">
      <path
        fill="#EA4335"
        d="M12 10.2v3.9h5.5c-.24 1.4-1.7 4.1-5.5 4.1-3.3 0-6-2.7-6-6.2s2.7-6.2 6-6.2c1.9 0 3.15.8 3.9 1.5l2.65-2.55C16.9 3.05 14.7 2 12 2 6.9 2 2.8 6.1 2.8 11.2S6.9 20.4 12 20.4c6.9 0 9.4-4.85 9.4-7.35 0-.5-.05-.85-.12-1.2H12z"
      />
    </svg>
  ),
  apple: (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
      <path d="M16.36 1.43c0 1.14-.42 2.2-1.24 3.02-.85.86-2.15 1.53-3.24 1.44-.13-1.1.42-2.26 1.2-3.05.86-.9 2.3-1.55 3.28-1.41zM20.4 17.1c-.55 1.28-.82 1.85-1.53 2.98-1 1.56-2.4 3.51-4.15 3.53-1.55.02-1.95-1-4.05-.99-2.1.01-2.55 1.01-4.1.99-1.75-.02-3.08-1.78-4.08-3.34C-.24 16.5-.72 11.7 1.4 8.63c1.13-1.63 2.94-2.6 4.55-2.63 1.65-.03 2.6 1.11 3.9 1.11 1.28 0 2.05-1.11 3.9-1.09 1.53.02 3.03.72 4.15 2.16-3.65 2-3.06 7.16-.5 8.92z" />
    </svg>
  ),
  facebook: (
    <svg viewBox="0 0 24 24" className="h-4 w-4">
      <path
        fill="#1877F2"
        d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.16 8.44 9.94v-7.03H7.9v-2.9h2.54V9.85c0-2.5 1.49-3.89 3.77-3.89 1.1 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.78-1.63 1.57v1.88h2.78l-.44 2.9h-2.34V22c4.78-.78 8.44-4.93 8.44-9.94z"
      />
    </svg>
  ),
};

export default function SocialButton({ provider, label, onClick, className = "", disabled = false, descriptionId }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-describedby={disabled ? descriptionId : undefined}
      title={disabled ? `${label} sign-in is not configured yet` : undefined}
      className={`focus-ring flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2 py-3 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-white/60 disabled:text-slate-500 disabled:hover:bg-white/60 sm:gap-2 sm:px-3 sm:text-sm ${className}`}
    >
      {ICONS[provider]}
      {label}
    </button>
  );
}
