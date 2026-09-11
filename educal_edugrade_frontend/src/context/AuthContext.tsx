import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getMyProfile } from "../services/api";

interface AuthUser {
  role: string;
  username: string | null;
  profileImage: string | null;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AuthUser | null;
  login: (token: string, role: string, username?: string) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Pulls the avatar (and anything else not stored in localStorage) from the
  // backend. Failures are ignored here - the initials-fallback avatar covers
  // it, and a real auth problem already gets handled by the 401 interceptor.
  const refreshUser = useCallback(async () => {
    try {
      const profile = await getMyProfile();
      localStorage.setItem("username", profile.username);
      setUser((prev) =>
        prev ? { ...prev, username: profile.username, profileImage: profile.profile_image ?? null } : prev
      );
    } catch {
      // ignore - covered by the fallback avatar / the 401 interceptor
    }
  }, []);

  useEffect(() => {
    // Check if a token and role exist in localStorage
    const token = localStorage.getItem("access_token");
    const role = localStorage.getItem("user_role");
    if (token && role) {
      setIsAuthenticated(true);
      setUser({ role, username: localStorage.getItem("username"), profileImage: null });
      refreshUser();
    } else {
      setIsAuthenticated(false);
      setUser(null);
    }
    setIsLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]); // Re-run on route change to keep context in sync

  const login = (token: string, role: string, username?: string) => {
    localStorage.setItem("access_token", token);
    localStorage.setItem("user_role", role);
    if (username) {
      localStorage.setItem("username", username);
    }
    setIsAuthenticated(true);
    setUser({ role, username: username ?? null, profileImage: null });
    refreshUser();
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_role");
    localStorage.removeItem("username");
    localStorage.removeItem("staff_id");
    localStorage.removeItem("student_id");
    setIsAuthenticated(false);
    setUser(null);
    navigate("/"); // Login is mounted at "/", not "/login"
  };

  // Memoize context value to avoid unnecessary re-renders
  const contextValue = useMemo(
    () => ({ isAuthenticated, isLoading, user, login, logout, refreshUser }),
    [isAuthenticated, isLoading, user, refreshUser]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
