import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import Login from "../../pages/auth/Login";
import Register from "../../pages/auth/Register";
import SocialButton from "../ui/SocialButton";

const BANNERS = [
  {
    image: "/images/airliner-clouds.png",
    label: "FLY TO YOUR DREAM DESTINATION",
    title: "No convenience fee on flights",
  },
  {
    image: "/images/sunset-pool.png",
    label: "STAY SOMEWHERE SPECIAL",
    title: "Find your perfect escape",
  },
  {
    image: "/images/highway-bus.png",
    label: "ENJOY THE JOURNEY",
    title: "Make every mile count",
  },
];

export default function AuthDialog({ mode, onClose, onModeChange }) {
  const [activeBanner, setActiveBanner] = useState(0);
  const [bannerPaused, setBannerPaused] = useState(false);
  const backgroundTouchY = useRef(null);

  useEffect(() => {
    const previouslyFocused = document.activeElement;

    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      previouslyFocused?.focus?.();
    };
  }, [onClose]);

  useEffect(() => {
    if (bannerPaused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;

    const timer = window.setInterval(() => {
      setActiveBanner((current) => (current + 1) % BANNERS.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, [bannerPaused]);

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center touch-pan-y bg-[#071a14]/65 p-3 backdrop-blur-md sm:p-6"
      onWheel={(event) => {
        if (!event.target.closest?.('[role="dialog"]')) window.scrollBy(0, event.deltaY);
      }}
      onTouchStart={(event) => {
        backgroundTouchY.current = event.target.closest?.('[role="dialog"]')
          ? null
          : event.touches[0].clientY;
      }}
      onTouchMove={(event) => {
        if (backgroundTouchY.current === null) return;
        const currentY = event.touches[0].clientY;
        window.scrollBy(0, backgroundTouchY.current - currentY);
        backgroundTouchY.current = currentY;
      }}
      onTouchEnd={() => { backgroundTouchY.current = null; }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label={mode === "login" ? "Sign in to PlanMyTrip" : "Create your PlanMyTrip account"}
        className="auth-panel-enter relative my-auto h-[min(480px,calc(100svh-32px))] w-full max-w-[380px] overflow-visible"
      >
        <div className="flex h-full flex-col overflow-hidden rounded-[22px] bg-white shadow-[0_30px_100px_rgba(0,0,0,.3)]">
        <section
          aria-label="Travel inspiration"
          aria-roledescription="carousel"
          className="relative h-[120px] shrink-0 overflow-hidden rounded-t-[22px] bg-[#123d35] sm:h-[132px]"
          onMouseEnter={() => setBannerPaused(true)}
          onMouseLeave={() => setBannerPaused(false)}
          onFocusCapture={() => setBannerPaused(true)}
          onBlurCapture={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) setBannerPaused(false);
          }}
        >
          <div
            aria-hidden="true"
            className="absolute inset-0 flex transition-transform duration-700 ease-out motion-reduce:transition-none"
            style={{ transform: `translateX(-${activeBanner * 100}%)` }}
          >
            {BANNERS.map((banner) => (
              <div
                key={banner.image}
                className="h-full min-w-full bg-cover bg-center"
                style={{ backgroundImage: `url("${banner.image}")` }}
              />
            ))}
          </div>
          <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-[#061c19]/75 via-[#061c19]/30 to-[#061c19]/10" />
            <div className="absolute left-4 right-4 top-3 min-w-0">
              <p className="text-[8px] font-semibold tracking-[.12em] text-white/80 sm:text-[9px]">{BANNERS[activeBanner].label}</p>
              <p className="mt-1 font-sans text-sm font-bold leading-tight text-white sm:text-base">{BANNERS[activeBanner].title}</p>
            </div>
            <div className="absolute inset-x-0 bottom-8 flex justify-center gap-1.5" aria-label="Choose banner">
              {BANNERS.map((banner, index) => (
                <button
                  key={banner.image}
                  type="button"
                  aria-label={`Show banner ${index + 1}`}
                  aria-current={index === activeBanner ? "true" : undefined}
                  onClick={() => setActiveBanner(index)}
                  className={`h-2 rounded-full transition-all ${index === activeBanner ? "w-5 bg-white" : "w-2 bg-white/55 hover:bg-white/85"}`}
                />
              ))}
            </div>
        </section>

        <div className="relative z-10 -mt-6 min-h-0 flex-1 overflow-y-auto rounded-t-[24px] bg-white px-5 py-3">
          <div className="mx-auto w-full max-w-[440px]">
            <div className="mb-2 flex gap-2">
              <SocialButton provider="google" label="Google" disabled descriptionId="social-signin-status" className="!py-2 !text-xs" />
              <SocialButton provider="apple" label="Apple" disabled descriptionId="social-signin-status" className="!py-2 !text-xs" />
              <SocialButton provider="facebook" label="Facebook" disabled descriptionId="social-signin-status" className="!py-2 !text-xs" />
            </div>
            <p id="social-signin-status" className="sr-only">Provider sign-in will be available once connected.</p>
            <div className="mb-2.5 flex items-center gap-3 text-[10px] text-slate-400">
              <span className="h-px flex-1 bg-slate-200" />
              <span>or use your email</span>
              <span className="h-px flex-1 bg-slate-200" />
            </div>
            {mode === "login" ? (
              <Login embedded onModeChange={onModeChange} onClose={onClose} />
            ) : (
              <Register embedded onModeChange={onModeChange} />
            )}
          </div>
        </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close account dialog"
          className="focus-ring absolute -right-1 -top-1 z-10 grid h-9 w-9 place-items-center rounded-full border border-white/30 bg-[#102c26]/80 text-white shadow-lg backdrop-blur-sm transition hover:bg-[#102c26] sm:-right-3 sm:-top-3"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </section>
    </div>,
    document.body
  );
}