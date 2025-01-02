import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

type UserRole = "student" | "supervisor" | "admin";

// Add route protection component
const ProtectedRoute: React.FC<{
  allowedRoles: UserRole[];
  children: React.ReactNode;
}> = ({ allowedRoles, children }) => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    } else if (!user?.role || !allowedRoles.includes(user.role)) {
      navigate("/unauthorized");
    }
  }, [isAuthenticated, user, allowedRoles, navigate]);

  return <>{children}</>;
};

export default ProtectedRoute;
