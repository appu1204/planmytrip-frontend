import { useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AuthCard from "../../components/layout/AuthCard";
import Button from "../../components/ui/Button";
import { verifyOtp, resendOtp } from "../../api/auth";
import { useAuth } from "../../context/AuthContext";

const LENGTH = 6;

export default function VerifyOtp() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const email = state?.email;
  const [digits, setDigits] = useState(Array(LENGTH).fill(""));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState("");
  const inputsRef = useRef([]);

  const otp = digits.join("");

  const handleChange = (i) => (e) => {
    const val = e.target.value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[i] = val;
    setDigits(next);
    if (val && i < LENGTH - 1) inputsRef.current[i + 1]?.focus();
  };

  const handleKeyDown = (i) => (e) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      inputsRef.current[i - 1]?.focus();
    }
  };

  const onResend = async () => {
    if (!email) {
      setError("This code request is missing an email address.");
      return;
    }

    setError("");
    setMessage("");
    setResending(true);
    try {
      await resendOtp({ email });
      setMessage("A fresh code has been sent.");
    } catch (err) {
      setError(err.message);
    } finally {
      setResending(false);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (otp.length !== LENGTH) {
      setError(`Enter the ${LENGTH}-digit code`);
      return;
    }
    setLoading(true);
    try {
      const data = await verifyOtp({ email, otp });
      const token = data?.token ?? data?.accessToken ?? data?.access_token;
      const user = data?.user ?? data?.profile ?? null;

      // This is the step that actually returns the bearer token in this
      // backend, whether we arrived here from registration or from login.
      if (token) {
        login({ token, user });
        navigate(user?.persona ? "/home" : "/onboarding/persona");
      } else {
        // Verified but backend didn't hand back a session — safest fallback
        // is to send them to sign in rather than silently going nowhere.
        navigate("/login", { state: { justVerified: true } });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      title="Verify your email"
      subtitle={
        email
          ? `Enter the ${LENGTH}-digit code we sent to ${email}.`
          : `Enter the ${LENGTH}-digit code we sent you.`
      }
    >
      <form onSubmit={onSubmit} noValidate>
        <div className="flex justify-between gap-2">
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => (inputsRef.current[i] = el)}
              value={d}
              onChange={handleChange(i)}
              onKeyDown={handleKeyDown(i)}
              inputMode="numeric"
              maxLength={1}
              className="focus-ring h-14 w-12 rounded-xl border border-slate-200 text-center text-xl font-semibold text-slate-900"
            />
          ))}
        </div>
        {error && <p className="mt-3 text-sm font-medium text-red-500">{error}</p>}
        {message && <p className="mt-3 text-sm font-medium text-emerald-600">{message}</p>}

        <Button type="submit" loading={loading} className="mt-7">
          Verify code →
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Didn't get a code?{" "}
        <button
          type="button"
          className="font-semibold"
          style={{ color: "var(--brand)" }}
          onClick={onResend}
          disabled={resending}
        >
          {resending ? "Sending..." : "Resend"}
        </button>
      </p>
    </AuthCard>
  );
}
