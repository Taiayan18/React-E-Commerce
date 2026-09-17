import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

const API = import.meta.env.VITE_API_URL || "http://localhost:8080";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("zenvy_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem("zenvy_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("zenvy_user");
      localStorage.removeItem("zenvy_token");
    }
  }, [user]);

  // ── LOGIN ──────────────────────────────────────────────────
  const login = async (email, password) => {
    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (data.success) {
        localStorage.setItem("zenvy_token", data.token);
        setUser(data.user);
        return { success: true, role: data.user.role };
      }
      return { success: false, error: data.message, status: res.status };
    } catch {
      return { success: false, error: "Cannot connect to server. Please try again." };
    }
  };

  // ── REGISTER ───────────────────────────────────────────────
  // adminKey frontend pe collect karta hai, backend pe bhejta hai
  // Key kabhi frontend code/browser mein store nahi hoti
  const register = async (name, email, password, role, adminKey) => {
    try {
      const res = await fetch(`${API}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role, adminKey }),
      });
      const data = await res.json();

      if (data.success) {
        localStorage.setItem("zenvy_token", data.token);
        setUser(data.user);
        return { success: true, role: data.user.role };
      }
      return { success: false, error: data.message, status: res.status };
    } catch {
      return { success: false, error: "Cannot connect to server. Please try again." };
    }
  };

  const logout = () => setUser(null);

  // ── FORGOT PASSWORD: Step 1 — email pe OTP bhejo ────────────
  const forgotPassword = async (email) => {
    try {
      const res = await fetch(`${API}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      return { success: data.success, message: data.message };
    } catch {
      return { success: false, message: "Cannot connect to server. Please try again." };
    }
  };

  // ── FORGOT PASSWORD: Step 2 — OTP verify + naya password set ─
  const resetPassword = async (email, otp, newPassword) => {
    try {
      const res = await fetch(`${API}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword }),
      });
      const data = await res.json();
      return { success: data.success, message: data.message };
    } catch {
      return { success: false, message: "Cannot connect to server. Please try again." };
    }
  };

  const isAdmin = user?.role === "admin";
  const isLoggedIn = !!user;
  const token = typeof window !== "undefined" ? localStorage.getItem("zenvy_token") : null;

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, isAdmin, token, login, register, logout, forgotPassword, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
