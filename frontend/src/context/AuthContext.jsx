import { createContext, useContext, useState } from "react";
import api from "../api/client";

const AuthContext = createContext(null);
const STORAGE_KEY = "khmer_cinema_user";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const persist = (nextUser) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
    setUser(nextUser);
  };

  const login = (userData) => {
    const next = { role: userData.role || "customer", ...userData };
    persist(next);
  };

  const loginWithToken = ({ token, user: profile }) => {
    persist({ ...profile, token });
  };

  const updateUser = (updates) => {
    setUser((prev) => {
      const next = { ...prev, ...updates };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const logout = async () => {
    try {
      await api.post("/logout");
    } catch {
      // ignore network errors on logout
    }
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  };

  return (
<AuthContext.Provider
        value={{
          user,
          login,
          loginWithToken,
          updateUser,
          logout,
          isAuthenticated: !!user,
        }}
      >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
