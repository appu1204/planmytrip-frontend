import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import AuthCard from "../../components/layout/AuthCard";
import { verifyEmail } from "../../api/auth";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState(() => (token ? "loading" : "error"));

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    verifyEmail(token)
      .then(() => {
        if (!cancelled) setStatus("success");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [token]);


  const content = {
    loading: {
      icon: <Loader2 className="h-6 w-6 animate-spin" />,
      title: "Verifying your email…",
      subtitle: "Hang tight, this only takes a second.",
    },
    success: {
      icon: <CheckCircle2 className="h-6 w-6" />,
      title: "Email verified",
      subtitle: "Your account is ready. You can sign in now.",
    },
    error: {
      icon: <XCircle className="h-6 w-6" />,
      title: "Verification failed",
      subtitle: "This link may have expired. Try signing in to request a new one.",
    },
  }[status];

  return (
    <AuthCard title={content.title} subtitle={content.subtitle}>
      <div className="flex flex-col items-center text-center">
        <div
          className="grid h-14 w-14 place-items-center rounded-full"
          style={{
            backgroundColor: status === "error" ? "#fee2e2" : "var(--brand-light)",
            color: status === "error" ? "#dc2626" : "var(--brand)",
          }}
        >
          {content.icon}
        </div>
        <Link to="/login" className="mt-7 text-sm font-semibold" style={{ color: "var(--brand)" }}>
          Go to sign in
        </Link>
      </div>
    </AuthCard>
  );
}
