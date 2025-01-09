import { useAuth, hasPermission } from "../contexts/AuthContext";

// Define common admin permissions
export const AdminPermissions = {
  MANAGE_USERS: "MANAGE_USERS",
  MANAGE_THESIS: "MANAGE_THESIS",
  MANAGE_SYSTEM: "MANAGE_SYSTEM",
  VIEW_REPORTS: "VIEW_REPORTS",
  MANAGE_SUPERVISORS: "MANAGE_SUPERVISORS",
} as const;

export type AdminPermission = keyof typeof AdminPermissions;

export const usePermissionCheck = () => {
  const { user } = useAuth();

  return {
    hasPermission: (permission: AdminPermission) =>
      hasPermission(user, AdminPermissions[permission]),
    // Helper methods for common permissions
    canManageUsers: () => hasPermission(user, AdminPermissions.MANAGE_USERS),
    canManageThesis: () => hasPermission(user, AdminPermissions.MANAGE_THESIS),
    canManageSystem: () => hasPermission(user, AdminPermissions.MANAGE_SYSTEM),
    canViewReports: () => hasPermission(user, AdminPermissions.VIEW_REPORTS),
    canManageSupervisors: () =>
      hasPermission(user, AdminPermissions.MANAGE_SUPERVISORS),
  };
};
