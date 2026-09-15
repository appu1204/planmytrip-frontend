import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../../components/layout/AuthLayout";
import Input from "../../components/ui/Input";
import PasswordInput from "../../components/ui/PasswordInput";
import Button from "../../components/ui/Button";
import SocialButton from "../../components/ui/SocialButton";
import { registerUser } from "../../api/auth";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    acceptTerms: true,
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
    if (!form.confirmPassword) next.confirmPassword = "Confirm password is required";
    else if (form.confirmPassword !== form.password) next.confirmPassword = "Passwords don't match";
    if (!form.acceptTerms) next.acceptTerms = "You must accept the terms to continue";
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

  return (
    <AuthLayout
      eyebrow="Onboarding"
      headline="Plan trips your"
      headlineAccent="whole crew will love."
      description="Curated destinations, real safety notes, and day-by-day plans everyone can agree on — built together, in minutes."
      stats={[
        { value: "48,900+", label: "trips planned" },
        { value: "4.9 / 5", label: "traveller trust score" },
        { value: "120+", label: "curated destinations" },
      ]}
      testimonial={{
        initials: "PD",
        quote: "We booked our Kerala trip in one evening — everyone helped pick the stops.",
      }}
    >
      <h2 className="font-display text-3xl font-semibold text-slate-900">Create your account</h2>
      <p className="mt-2 text-sm text-slate-500">Start planning smarter trips you'll love.</p>

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
            <Button onClick={() => navigate("/login")}>
              Go to Sign In →
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="mt-7 flex gap-3">
            <SocialButton provider="google" label="Google" />
            <SocialButton provider="apple" label="Apple" />
            <SocialButton provider="facebook" label="Facebook" />
          </div>

          <div className="my-6 flex items-center gap-3 text-xs text-slate-400">
            <div className="h-px flex-1 bg-slate-200" />
            or sign up with email
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          {apiError && (
            <div className="mb-4 rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">
              {apiError}
            </div>
          )}

          <form className="space-y-4" onSubmit={onSubmit} noValidate>
        <Input
          label="Full name"
          placeholder="Your full name"
          value={form.fullName}
          onChange={onChange("fullName")}
          error={errors.fullName}
          autoComplete="name"
        />
        <Input
          label="Email address"
          type="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={onChange("email")}
          error={errors.email}
          autoComplete="email"
        />
        <Input
          label="Phone number"
          type="tel"
          placeholder="+1 555 123 4567"
          value={form.phone}
          onChange={onChange("phone")}
          error={errors.phone}
          autoComplete="tel"
        />
        <div className="grid grid-cols-2 gap-4">
          <PasswordInput
            label="Password"
            placeholder="Create a password"
            value={form.password}
            onChange={onChange("password")}
            error={errors.password}
            showStrength
            autoComplete="new-password"
          />
          <PasswordInput
            label="Confirm password"
            placeholder="Repeat password"
            value={form.confirmPassword}
            onChange={onChange("confirmPassword")}
            error={errors.confirmPassword}
            autoComplete="new-password"
          />
        </div>

        <label className="flex items-start gap-2.5 text-sm text-slate-600">
          <input
            type="checkbox"
            className="focus-ring mt-0.5 h-4 w-4 rounded border-slate-300"
            checked={form.acceptTerms}
            onChange={onChange("acceptTerms")}
          />
          <span>
            I agree to PlanMyTrip's{" "}
            <a className="font-medium" style={{ color: "var(--brand)" }} href="#">
              Terms of Service
            </a>{" "}
            and{" "}
            <a className="font-medium" style={{ color: "var(--brand)" }} href="#">
              Privacy Policy
            </a>
            .
          </span>
        </label>
        {errors.acceptTerms && (
          <p className="-mt-2 text-xs font-medium text-red-500">{errors.acceptTerms}</p>
        )}

        <Button type="submit" loading={loading}>
          Create account →
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Already planning with us?{" "}
        <Link to="/login" className="font-semibold" style={{ color: "var(--brand)" }}>
          Sign in
        </Link>
      </p>
        </>
      )}
    </AuthLayout>
  );
}
