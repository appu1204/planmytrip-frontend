import { useState } from "react";
import { Link, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import AuthLayout from "../../components/layout/AuthLayout";
import Input from "../../components/ui/Input";
import PasswordInput from "../../components/ui/PasswordInput";
import Button from "../../components/ui/Button";
import SocialButton from "../../components/ui/SocialButton";
import { loginUser } from "../../api/auth";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { login } = useAuth();
  const isVerified = searchParams.get("verified") === "true";
  const [form, setForm] = useState({
    email: location.state?.email || "",
    password: "",
    keepSignedIn: true,
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);

  const onChange = (field) => (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((er) => ({ ...er, [field]: undefined }));
  };

  const validate = () => {
    const next = {};
    if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = "Enter a valid email address";
    if (!form.password) next.password = "Enter your password";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setApiError("");
    if (!validate()) return;
    setLoading(true);
    try {
      const data = await loginUser({ email: form.email, password: form.password });

      // Some backends return the bearer token straight from /auth/login;
      // others (like this one) only send an OTP here and return the token
      // from /auth/verify-otp instead. Handle both without guessing wrong.
      if (data?.token) {
        login({ token: data.token, user: data.user });
        navigate(data.user?.persona ? "/home" : "/onboarding/persona");
      } else {
        navigate("/verify-otp", { state: { email: form.email, flow: "login" } });
      }
    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="Welcome back"
      headline="Pick up where"
      headlineAccent="you left off."
      description="Your saved trips, wishlists and itineraries are exactly where you left them."
      testimonial={{
        initials: "PD",
        quote: "Everything I'd planned was right there when I logged back in.",
      }}
    >
      <h2 className="font-display text-3xl font-semibold text-slate-900">Welcome back</h2>
      <p className="mt-2 text-sm text-slate-500">Sign in to pick up right where you left off.</p>

      <div className="mt-7 flex gap-3">
        <SocialButton provider="google" label="Google" />
        <SocialButton provider="apple" label="Apple" />
        <SocialButton provider="facebook" label="Facebook" />
      </div>

      <div className="my-6 flex items-center gap-3 text-xs text-slate-400">
        <div className="h-px flex-1 bg-slate-200" />
        or sign in with email
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      {isVerified && (
        <div className="mb-4 rounded-lg bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-700 border border-emerald-200">
          Email verified successfully! You can now sign in.
        </div>
      )}

      {location.state?.justReset && (
        <div className="mb-4 rounded-lg bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-700 border border-emerald-200">
          Password reset successfully! Please sign in with your new password.
        </div>
      )}

      {apiError && (
        <div className="mb-4 rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">
          {apiError}
        </div>
      )}

      <form className="space-y-4" onSubmit={onSubmit} noValidate>
        <Input
          label="Email address"
          type="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={onChange("email")}
          error={errors.email}
          autoComplete="email"
        />
        <PasswordInput
          label="Password"
          placeholder="Your password"
          value={form.password}
          onChange={onChange("password")}
          error={errors.password}
          autoComplete="current-password"
        />

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-slate-600">
            <input
              type="checkbox"
              className="focus-ring h-4 w-4 rounded border-slate-300"
              checked={form.keepSignedIn}
              onChange={onChange("keepSignedIn")}
            />
            Keep me signed in
          </label>
          <Link to="/forgot-password" className="font-semibold" style={{ color: "var(--brand)" }}>
            Forgot password?
          </Link>
        </div>

        <Button type="submit" loading={loading}>
          Sign in →
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        New to PlanMyTrip?{" "}
        <Link to="/register" className="font-semibold" style={{ color: "var(--brand)" }}>
          Create an account
        </Link>
      </p>
    </AuthLayout>
  );
}
