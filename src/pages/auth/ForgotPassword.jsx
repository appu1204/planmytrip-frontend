import { useState } from "react";
import { Link } from "react-router-dom";
import AuthCard from "../../components/layout/AuthCard";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { forgotPassword } from "../../api/auth";
import { MailCheck } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("Enter a valid email address");
      return;
    }
    setLoading(true);
    try {
      await forgotPassword({ email });
      setSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <AuthCard title="Check your inbox" subtitle="">
        <div className="flex flex-col items-center text-center">
          <div
            className="grid h-14 w-14 place-items-center rounded-full"
            style={{ backgroundColor: "var(--brand-light)", color: "var(--brand)" }}
          >
            <MailCheck className="h-6 w-6" />
          </div>
          <p className="mt-4 text-sm text-slate-500">
            If an account exists for <span className="font-medium text-slate-700">{email}</span>,
            we've sent a link to reset your password.
          </p>
          <Link to="/login" className="mt-6 text-sm font-semibold" style={{ color: "var(--brand)" }}>
            Back to sign in
          </Link>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Forgot your password?"
      subtitle="Enter your email and we'll send you a link to reset it."
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <Input
          label="Email address"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError("");
          }}
          error={error}
          autoComplete="email"
        />
        <Button type="submit" loading={loading}>
          Send reset link →
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
