import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import AuthCard from "../../components/layout/AuthCard";
import PasswordInput from "../../components/ui/PasswordInput";
import Button from "../../components/ui/Button";
import { resetPassword } from "../../api/auth";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);

  const onChange = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setErrors((er) => ({ ...er, [field]: undefined }));
  };

  const validate = () => {
    const next = {};
    if (form.password.length < 8) next.password = "Use at least 8 characters";
    if (form.confirmPassword !== form.password) next.confirmPassword = "Passwords don't match";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setApiError("");
    if (!validate()) return;
    setLoading(true);
    try {
      await resetPassword({
        token,
        newPassword: form.password,
        confirmPassword: form.confirmPassword,
      });
      navigate("/login", { state: { justReset: true } });
    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard title="Set a new password" subtitle="Make it something you'll remember this time.">
      {!token && (
        <div className="mb-4 rounded-lg bg-amber-50 px-4 py-2.5 text-sm text-amber-700">
          This reset link is missing or invalid. Request a new one from the forgot password page.
        </div>
      )}
      {apiError && (
        <div className="mb-4 rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">
          {apiError}
        </div>
      )}
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <PasswordInput
          label="New password"
          placeholder="Create a new password"
          value={form.password}
          onChange={onChange("password")}
          error={errors.password}
          showStrength
          autoComplete="new-password"
        />
        <PasswordInput
          label="Confirm new password"
          placeholder="Repeat new password"
          value={form.confirmPassword}
          onChange={onChange("confirmPassword")}
          error={errors.confirmPassword}
          autoComplete="new-password"
        />
        <Button type="submit" loading={loading} disabled={!token}>
          Reset password →
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500">
        <Link to="/login" className="font-semibold" style={{ color: "var(--brand)" }}>
          Back to sign in
        </Link>
      </p>
    </AuthCard>
  );
}
