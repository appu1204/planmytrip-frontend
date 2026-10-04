import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { getCurrentUser } from "../api/users";

const AuthContext = createContext(null);

function normalizeUser(raw) {
  if (!raw || typeof raw !== "object") return null;
  return {
    ...raw,
    id: raw.id ?? raw.userId ?? raw._id,
    fullName: raw.fullName ?? raw.name ?? raw.username ?? (raw.email ? raw.email.split("@")[0] : "Traveler"),
    persona: raw.persona || "family",
  };
}

function safeGetCachedUser() {
  try {
    const cached = localStorage.getItem("pmt_user");
    return cached ? normalizeUser(JSON.parse(cached)) : null;
  } catch {
    localStorage.removeItem("pmt_user");
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("pmt_token"));
  const [user, setUser] = useState(safeGetCachedUser);
  const [loading, setLoading] = useState(Boolean(token) && !user);

  const logout = useCallback(() => {
    localStorage.removeItem("pmt_token");
    localStorage.removeItem("pmt_user");
    setToken(null);
    setUser(null);
  }, []);

  // Listen to 401 unauthorized broadcasts from client interceptor
  useEffect(() => {
    const onUnauthorized = () => {
      logout();
    };
    window.addEventListener("pmt-auth-unauthorized", onUnauthorized);
    return () => window.removeEventListener("pmt-auth-unauthorized", onUnauthorized);
  }, [logout]);

  // Synchronize auth state across multiple browser tabs
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "pmt_token" || e.key === "pmt_user") {
        setToken(localStorage.getItem("pmt_token"));
        setUser(safeGetCachedUser());
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Hydrate user profile from backend when token exists but profile isn't cached
  useEffect(() => {
    if (token && !user) {
      let cancelled = false;
      getCurrentUser()
        .then((data) => {
          if (cancelled) return;
          const normalized = normalizeUser(data);
          setUser(normalized);
          if (normalized) {
            localStorage.setItem("pmt_user", JSON.stringify(normalized));
          }
        })
        .catch(() => {
          if (cancelled) return;
          logout();
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });

      return () => {
        cancelled = true;
      };
    }
  }, [token, user, logout]);

  const login = useCallback(({ token: newToken, user: newUser }) => {
    const normalized = normalizeUser(newUser);
    localStorage.setItem("pmt_token", newToken);
    if (normalized) {
      localStorage.setItem("pmt_user", JSON.stringify(normalized));
    }
    setToken(newToken);
    setUser(normalized);
  }, []);

  const updateUser = useCallback((patch) => {
    setUser((prev) => {
      const next = normalizeUser({ ...prev, ...patch });
      if (next) {
        localStorage.setItem("pmt_user", JSON.stringify(next));
      }
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token),
      loading,
      login,
      logout,
      updateUser,
    }),
    [token, user, loading, login, logout, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}


