import { UserRole } from "@prisma/client";
import { useAuth, hasRole } from "../contexts/AuthContext";

export const useRoleCheck = () => {
  const { user } = useAuth();

  return {
    isStudent: () => hasRole(user, UserRole.STUDENT),
    isSupervisor: () => hasRole(user, UserRole.SUPERVISOR),
    isAdmin: () => hasRole(user, UserRole.ADMIN),
    hasRole: (role: UserRole) => hasRole(user, role),
  };
};
