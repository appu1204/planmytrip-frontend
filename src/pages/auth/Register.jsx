import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../../components/layout/AuthLayout";
import Input from "../../components/ui/Input";
import PasswordInput from "../../components/ui/PasswordInput";
import Button from "../../components/ui/Button";
import { registerUser } from "../../api/auth";
import { KeyRound, Mail, Phone, UserRound } from "lucide-react";

export default function Register({ embedded = false, onModeChange }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const [successMessage, setSuccessMessage] = useState("");

  const onChange = (field) => (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((er) => ({ ...er, [field]: undefined }));
  };

  const validate = () => {
    const next = {};
    if (!form.fullName.trim()) next.fullName = "Enter your full name";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = "Enter a valid email address";
    if (!form.phone.trim()) next.phone = "Phone number is required";
    else if (!/^\+?[0-9\s().-]{7,15}$/.test(form.phone.trim())) next.phone = "Enter a valid phone number";
    if (!form.password) next.password = "Password is required";
    else if (form.password.length < 8) next.password = "Use at least 8 characters";
    if (!form.confirmPassword) next.confirmPassword = "Re-type your password";
    else if (form.confirmPassword !== form.password) next.confirmPassword = "Passwords don't match. Re-type your password.";
    if (!form.acceptTerms) next.acceptTerms = "Please accept the Terms of Service and Privacy Policy to continue.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setApiError("");
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await registerUser({
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        password: form.password,
        confirmPassword: form.confirmPassword,
      });
      setSuccessMessage(
        res?.message ||
          "Registration successful! We have sent a verification link to your email. Please verify your email before logging in."
      );
    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formContent = (
    <>
      <h2 className={`font-bold leading-tight text-[#10382b] ${embedded ? "font-sans text-[23px]" : "font-display text-3xl"}`}>
        Create your <span className={embedded ? "text-[#2875e8]" : ""}>account</span>
      </h2>
      <p className={`text-slate-500 ${embedded ? "mt-1 text-xs sm:text-sm" : "mt-2 text-sm"}`}>Bring every travel detail together in one place.</p>

      {successMessage ? (
        <div className="my-6 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-6 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="font-display text-lg font-semibold text-emerald-950">Verify your email address</h3>
          <p className="mt-2 text-sm text-emerald-800 leading-relaxed">
            {successMessage}
          </p>
          <p className="mt-1 text-xs text-emerald-600">
            Click the link in the email to activate your account.
          </p>
          <div className="mt-6">
            <Button onClick={() => embedded ? onModeChange("login") : navigate("/login")}>
              Go to Sign In →
            </Button>
          </div>
        </div>
      ) : (
        <>
          {apiError && (
            <div role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {apiError}
            </div>
          )}

          <form className={embedded ? "mt-3 space-y-3" : "space-y-3"} onSubmit={onSubmit} noValidate>
        <Input
          label="Full name"
          leadingIcon={embedded ? UserRound : undefined}
          floatingLabel={embedded}
          className={embedded ? "!py-2.5 !text-sm" : "!py-2.5"}
          placeholder="Your name"
          required
          value={form.fullName}
          onChange={onChange("fullName")}
          error={errors.fullName}
          autoComplete="name"
        />
        <Input
          label="Email address"
          leadingIcon={embedded ? Mail : undefined}
          floatingLabel={embedded}
          className={embedded ? "!py-2.5 !text-sm" : "!py-2.5"}
          type="email"
          placeholder="you@example.com"
          required
          value={form.email}
          onChange={onChange("email")}
          error={errors.email}
          autoComplete="email"
        />
        <Input
          label="Phone number"
          leadingIcon={embedded ? Phone : undefined}
          floatingLabel={embedded}
          className={embedded ? "!py-2.5 !text-sm" : "!py-2.5"}
          type="tel"
          placeholder="+1 (555) 123-4567"
          required
          value={form.phone}
          onChange={onChange("phone")}
          error={errors.phone}
          autoComplete="tel"
        />
        <div className={`grid grid-cols-1 ${embedded ? "gap-2" : "gap-3 sm:grid-cols-2"}`}>
          <PasswordInput
            label="Password"
            leadingIcon={embedded ? KeyRound : undefined}
            floatingLabel={embedded}
            className={embedded ? "!py-2.5 !text-sm" : "!py-2.5"}
            placeholder="At least 8 characters"
            required
            value={form.password}
            onChange={onChange("password")}
            error={errors.password}
            showStrength
            autoComplete="new-password"
          />
          <PasswordInput
            label="Re-type password"
            leadingIcon={embedded ? KeyRound : undefined}
            floatingLabel={embedded}
            className={embedded ? "!py-2.5 !text-sm" : "!py-2.5"}
            placeholder="Re-type password"
            required
            value={form.confirmPassword}
            onChange={onChange("confirmPassword")}
            error={errors.confirmPassword}
            autoComplete="new-password"
          />
        </div>

        <label className={`flex items-start gap-2.5 leading-5 text-slate-600 ${embedded ? "text-xs" : "text-xs sm:text-sm"}`}>
          <input
            type="checkbox"
            className="focus-ring mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 accent-[var(--brand)]"
            checked={form.acceptTerms}
            onChange={onChange("acceptTerms")}
            required
            aria-invalid={errors.acceptTerms ? "true" : undefined}
            aria-describedby={errors.acceptTerms ? "terms-error" : undefined}
          />
          <span>
            I agree to PlanMyTrip's{" "}
            <span className="font-medium text-slate-700">
              Terms of Service
            </span>{" "}
            and{" "}
            <span className="font-medium text-slate-700">
              Privacy Policy
            </span>
            .
          </span>
        </label>
        {errors.acceptTerms && (
          <p id="terms-error" role="alert" className="-mt-2 text-xs font-medium text-red-600">{errors.acceptTerms}</p>
        )}

        <Button type="submit" loading={loading} className={embedded ? "rounded-lg !py-2 text-sm shadow-lg shadow-emerald-900/10" : "rounded-lg py-3.5 text-sm shadow-lg shadow-emerald-900/10"}>
          Create account
        </Button>
      </form>

      <p className={`text-center text-slate-500 ${embedded ? "mt-3 text-xs leading-5" : "mt-4 text-sm"}`}>
        Already planning with us?{" "}
        {embedded ? (
          <button type="button" onClick={() => onModeChange("login")} className="font-semibold transition-colors hover:underline" style={{ color: "var(--brand)" }}>
            Sign in
          </button>
        ) : (
          <Link to="/login" className="font-semibold transition-colors hover:underline" style={{ color: "var(--brand)" }}>
            Sign in
          </Link>
        )}
      </p>
        </>
      )}
    </>
  );

  if (embedded) return formContent;

  return (
    <AuthLayout
      mode="register"
      eyebrow="PLAN TOGETHER"
      headline="Plan trips your"
      headlineSecondLine="whole crew"
      headlineAccent="will love."
      description="Bring the people, places, and little details that make a trip yours into one clear plan."
      highlights={["Build day-by-day itineraries", "Keep trip details organized", "Discover new destinations"]}
    >
      {formContent}
    </AuthLayout>
  );
}
