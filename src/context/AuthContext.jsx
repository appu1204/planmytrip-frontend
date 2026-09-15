import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getCurrentUser } from "../api/users";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("pmt_token"));
  const [user, setUser] = useState(() => {
    const cached = localStorage.getItem("pmt_user");
    return cached ? JSON.parse(cached) : null;
  });
  const [loading, setLoading] = useState(Boolean(token) && !user);

  useEffect(() => {
    // If we have a token but no cached profile, hydrate it from /users/me.
    if (token && !user) {
      getCurrentUser()
        .then((data) => {
          setUser(data);
          localStorage.setItem("pmt_user", JSON.stringify(data));
        })
        .catch(() => {
          setToken(null);
          localStorage.removeItem("pmt_token");
        })
        .finally(() => setLoading(false));
    }
  }, [token, user]);

  const login = ({ token: newToken, user: newUser }) => {
    localStorage.setItem("pmt_token", newToken);
    localStorage.setItem("pmt_user", JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const updateUser = (patch) => {
    setUser((prev) => {
      const next = { ...prev, ...patch };
      localStorage.setItem("pmt_user", JSON.stringify(next));
      return next;
    });
  };

  const logout = () => {
    localStorage.removeItem("pmt_token");
    localStorage.removeItem("pmt_user");
    setToken(null);
    setUser(null);
  };

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
    [token, user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
