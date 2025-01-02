import React, { createContext, useContext, useState, useEffect } from "react";
import { userService } from "../services/userService";
import type { User, UserRole } from "@prisma/client";

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
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  getAuthHeader: () => { Authorization: string } | {};
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check for existing session
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
      setIsAuthenticated(true);
    }
  }, []);

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
          // If response is not JSON, use status text
          errorMessage = response.statusText || "Login failed";
        }
        throw new Error(errorMessage);
      }

      const { user: userData, token: authToken } = await response.json();

      // Store user and token in localStorage and state
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("token", authToken);
      setUser(userData);
      setToken(authToken);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
  };

  const getAuthHeader = () => {
    return token ? { Authorization: `Bearer ${token}` } : {};
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
