import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "../types";
import { api } from "../services/api";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshMe: () => Promise<void>;
  verifyEmail: (email: string, code: string) => Promise<void>;
  resendVerification: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshMe = async () => {
    try {
      const response = await api.auth.getMe();
      setUser(response);
    } catch (err) {
      console.error("Failed to load user info:", err);
      logout();
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem("smartswap_token");
      if (token) {
        try {
          const response = await api.auth.getMe();
          setUser(response);
        } catch (err) {
          console.error("Session token expired or is invalid.");
          localStorage.removeItem("smartswap_token");
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const data = await api.auth.login(email, password);
      localStorage.setItem("smartswap_token", data.token);
      setUser(data.user);
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setLoading(true);
    try {
      const data = await api.auth.register(name, email, password);
      localStorage.setItem("smartswap_token", data.token);
      setUser(data.user);
    } finally {
      setLoading(false);
    }
  };

  const verifyEmail = async (email: string, code: string) => {
    await api.auth.verifyCode(email, code);
    // Directly update the verified status locally
    if (user && user.email.toLowerCase() === email.toLowerCase()) {
      setUser({ ...user, isEmailVerified: true });
    } else {
      // If we verified but we are not fully logged in/synced yet, we can refresh
      try {
        const response = await api.auth.getMe();
        setUser(response);
      } catch (e) {
        // Safe check
      }
    }
  };

  const resendVerification = async (email: string) => {
    await api.auth.resendCode(email);
  };

  const logout = () => {
    localStorage.removeItem("smartswap_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshMe, verifyEmail, resendVerification }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }
  return context;
}
