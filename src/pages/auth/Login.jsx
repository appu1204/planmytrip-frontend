import { useState } from "react";
import { Link, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import AuthLayout from "../../components/layout/AuthLayout";
import Input from "../../components/ui/Input";
import PasswordInput from "../../components/ui/PasswordInput";
import Button from "../../components/ui/Button";
import { loginUser } from "../../api/auth";
import { useAuth } from "../../context/AuthContext";

export default function Login({ embedded = false, onModeChange, onClose }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { login } = useAuth();
  const isVerified = searchParams.get("verified") === "true";
  const [form, setForm] = useState({
    email: location.state?.email || "",
    password: "",
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
        onClose?.();
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

  const formContent = (
    <>
      <h2 className={`font-semibold leading-tight text-[#10382b] ${embedded ? "font-sans text-[22px]" : "font-display text-3xl"}`}>Welcome back</h2>
      {!embedded && <p className="mt-2 text-sm text-slate-500">Access your trips and continue planning.</p>}

      {isVerified && (
        <div role="status" className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
          Email verified successfully! You can now sign in.
        </div>
      )}

      {location.state?.justReset && (
        <div role="status" className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
          Password reset successfully! Please sign in with your new password.
        </div>
      )}

      {apiError && (
        <div role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {apiError}
        </div>
      )}

      <form className={embedded ? "space-y-2" : "space-y-4"} onSubmit={onSubmit} noValidate>
        <Input
          label="Email address"
          className={embedded ? "!py-2 !text-sm" : ""}
          labelClassName={embedded ? "!mb-1 !text-xs !font-semibold !text-slate-700" : ""}
          type="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={onChange("email")}
          error={errors.email}
          autoComplete="email"
        />
        <PasswordInput
          label="Password"
          className={embedded ? "!py-2 !text-sm" : ""}
          labelClassName={embedded ? "!mb-1 !text-xs !font-semibold !text-slate-700" : ""}
          placeholder="Your password"
          value={form.password}
          onChange={onChange("password")}
          error={errors.password}
          autoComplete="current-password"
        />

        <div className={`flex justify-end ${embedded ? "text-xs font-medium" : "text-sm"}`}>
          <Link to="/forgot-password" className="font-semibold" style={{ color: "var(--brand)" }}>
            Forgot password?
          </Link>
        </div>

        <Button type="submit" loading={loading} className={embedded ? "rounded-lg !py-2 text-sm" : "rounded-lg py-3.5 text-sm"}>
          Sign in
        </Button>
      </form>

      <p className={`text-center text-slate-500 ${embedded ? "mt-2 text-xs leading-5" : "mt-6 text-sm"}`}>
        New to PlanMyTrip?{" "}
        {embedded ? (
          <button type="button" onClick={() => onModeChange("register")} className="font-semibold transition-colors hover:underline" style={{ color: "var(--brand)" }}>
            Create an account
          </button>
        ) : (
          <Link to="/register" className="font-semibold transition-colors hover:underline" style={{ color: "var(--brand)" }}>
            Create an account
          </Link>
        )}
      </p>
    </>
  );

  if (embedded) return formContent;

  return (
    <AuthLayout
      mode="login"
      eyebrow="WELCOME BACK"
      headline="Pick up where"
      headlineSecondLine="you"
      headlineAccent="left off."
      description="Your saved trips, wishlists, and itineraries are ready right where you left them."
      highlights={["Your trips and plans in one place", "Pick up planning whenever you're ready"]}
    >
      {formContent}
    </AuthLayout>
  );
}
