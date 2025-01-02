import React, { createContext, useContext, useState, useEffect } from "react";
import { User, getUserByEmail, verifyPassword } from "../utils/userService";

interface AuthContextType {
  user: User | null;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check for existing session
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    try {
      const dbUser = await getUserByEmail(credentials.email);

      if (!dbUser) {
        throw new Error("Invalid credentials");
      }

      const isValidPassword = await verifyPassword(
        credentials.password,
        dbUser.password
      );

      if (!isValidPassword) {
        throw new Error("Invalid credentials");
      }

      // Remove password from user object before storing
      const { password, ...userWithoutPassword } = dbUser;

      localStorage.setItem("user", JSON.stringify(userWithoutPassword));
      setUser(userWithoutPassword);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
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
