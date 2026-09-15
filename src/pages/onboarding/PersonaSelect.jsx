import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check } from "lucide-react";
import Logo from "../../components/ui/Logo";
import Button from "../../components/ui/Button";
import { PERSONA_LIST } from "../../theme/personas";
import { updatePersona } from "../../api/users";
import { useAuth } from "../../context/AuthContext";

const STEP = 3;
const TOTAL_STEPS = 4;

export default function PersonaSelect() {
  const navigate = useNavigate();
  const { updateUser } = useAuth();
  const [selected, setSelected] = useState("family");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onContinue = async () => {
    setError("");
    setLoading(true);
    try {
      await updatePersona(selected);
      updateUser({ persona: selected });
      document.documentElement.dataset.persona = selected;
      navigate("/home");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const onSkip = () => navigate("/home");

  return (
    <div data-persona={selected} className="min-h-screen bg-[#f3f6f2]">
      <header className="flex items-center justify-between px-8 py-6">
        <Logo />
        <div className="hidden items-center gap-2 text-sm font-medium text-slate-500 sm:flex">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <span
              key={i}
              className={`h-1.5 w-6 rounded-full ${
                i < STEP ? "bg-[var(--brand)]" : "bg-slate-200"
              }`}
            />
          ))}
          <span className="ml-2">
            Step {STEP} of {TOTAL_STEPS}
          </span>
        </div>
        <button onClick={onSkip} className="text-sm font-medium text-slate-500 hover:text-slate-700">
          Skip for now
        </button>
      </header>

      <main className="mx-auto max-w-5xl px-6 pb-24 pt-10 text-center">
        <span
          className="text-xs font-bold uppercase tracking-widest"
          style={{ color: "var(--brand)" }}
        >
          Personalise your PlanMyTrip
        </span>
        <h1 className="mt-3 font-display text-4xl font-semibold text-slate-900">
          What kind of traveller are you?
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-slate-500">
          We'll tailor destinations, pricing and itineraries around this — you can always change
          it later.
        </p>

        {error && (
          <div className="mx-auto mt-6 max-w-md rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {PERSONA_LIST.map((persona) => {
            const Icon = persona.icon;
            const isSelected = selected === persona.key;
            return (
              <button
                key={persona.key}
                type="button"
                onClick={() => setSelected(persona.key)}
                className={`relative rounded-2xl border bg-white p-7 text-left transition ${
                  isSelected ? "shadow-card" : "border-slate-100 hover:border-slate-200"
                }`}
                style={isSelected ? { borderColor: "var(--brand)", borderWidth: 2 } : undefined}
              >
                {isSelected && (
                  <span
                    className="absolute right-4 top-4 grid h-6 w-6 place-items-center rounded-full text-white"
                    style={{ backgroundColor: "var(--brand)" }}
                  >
                    <Check className="h-3.5 w-3.5" />
                  </span>
                )}
                <div className={`mb-5 grid h-12 w-12 place-items-center rounded-xl ${persona.iconBg}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-display text-lg font-semibold text-slate-900">
                  {persona.label}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{persona.description}</p>
                {isSelected && (
                  <span
                    className="mt-4 inline-block rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide"
                    style={{ backgroundColor: "var(--brand-light)", color: "var(--brand-dark)" }}
                  >
                    Selected
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-10 flex justify-center">
          <Button className="max-w-xs" onClick={onContinue} loading={loading}>
            Continue with {PERSONA_LIST.find((p) => p.key === selected)?.label} →
          </Button>
        </div>
        <p className="mt-4 text-sm text-slate-400">
          You can switch your travel persona anytime from Profile settings.
        </p>
      </main>
    </div>
  );
}
