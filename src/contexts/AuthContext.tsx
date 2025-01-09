import React, { createContext, useContext, useState, useEffect } from "react";
import type { User, UserRole } from "@prisma/client";
import Cookies from "js-cookie";

type AuthUser = Omit<User, "passwordHash"> & {
  studentProfile?: {
    studentId: string;
    department: string;
    program: string;
    enrollmentYear: number;
  } | null;
  supervisorProfile?: {
    department: string;
    specialization: string;
  } | null;
  adminProfile?: {
    department: string;
    position: string;
    permissions: string[];
  } | null;
};

interface AuthContextType {
  user: AuthUser | null;
  login: (credentials: {
    email: string;
    password: string;
  }) => Promise<{ user: AuthUser; token: string }>;
  logout: () => void;
  isAuthenticated: boolean;
  getAuthHeader: () => { Authorization: string } | {};
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_COOKIE_NAME = "auth_token";
const USER_COOKIE_NAME = "auth_user";
const COOKIE_EXPIRY = 7; // days

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check for existing session from both localStorage and cookies
    const storedToken = Cookies.get(TOKEN_COOKIE_NAME);
    const storedUser = Cookies.get(USER_COOKIE_NAME);

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setToken(storedToken);
        setIsAuthenticated(true);

        // Also store in localStorage for backwards compatibility
        localStorage.setItem("token", storedToken);
        localStorage.setItem("user", storedUser);
      } catch (error) {
        console.error("Error parsing stored user:", error);
        clearAuthData();
      }
    }
  }, []);

  const clearAuthData = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    Cookies.remove(TOKEN_COOKIE_NAME);
    Cookies.remove(USER_COOKIE_NAME);
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
  };

  const login = async (credentials: { email: string; password: string }) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(credentials),
        }
      );

      if (!response.ok) {
        let errorMessage = "Login failed";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || "Login failed";
        } catch (e) {
          errorMessage = response.statusText || "Login failed";
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      const { user: userData, token: authToken } = data;

      // Store in both cookies and localStorage
      const userStr = JSON.stringify(userData);
      Cookies.set(TOKEN_COOKIE_NAME, authToken, {
        expires: COOKIE_EXPIRY,
        sameSite: "strict",
      });
      Cookies.set(USER_COOKIE_NAME, userStr, {
        expires: COOKIE_EXPIRY,
        sameSite: "strict",
      });
      localStorage.setItem("token", authToken);
      localStorage.setItem("user", userStr);

      setUser(userData);
      setToken(authToken);
      setIsAuthenticated(true);

      return data;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const logout = () => {
    clearAuthData();
  };

  const getAuthHeader = () => {
    // Try to get token from state, cookies, or localStorage
    const authToken =
      token || Cookies.get(TOKEN_COOKIE_NAME) || localStorage.getItem("token");
    return authToken ? { Authorization: `Bearer ${authToken}` } : {};
  };

  return (
    <AuthContext.Provider
      value={{ user, login, logout, isAuthenticated, getAuthHeader }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Helper function to check user role
export const hasRole = (user: AuthUser | null, role: UserRole): boolean => {
  return user?.role === role;
};

// Helper function to check admin permissions
export const hasPermission = (
  user: AuthUser | null,
  permission: string
): boolean => {
  return user?.adminProfile?.permissions.includes(permission) ?? false;
};
