export type AppRole = "ADMIN" | "NUTRITIONIST" | "USER";

export type Permission =
  | "dashboard:read"
  | "users:manage"
  | "criteria:manage"
  | "criteria:read"
  | "alternatives:manage"
  | "alternatives:read"
  | "assessments:manage"
  | "assessments:read"
  | "topsis:calculate"
  | "rankings:read"
  | "reports:import"
  | "audit:read"
  | "profile:update";

const rolePermissions: Record<AppRole, Permission[]> = {
  ADMIN: [
    "dashboard:read",
    "users:manage",
    "criteria:manage",
    "criteria:read",
    "alternatives:manage",
    "alternatives:read",
    "assessments:manage",
    "assessments:read",
    "topsis:calculate",
    "rankings:read",
    "reports:import",
    "audit:read",
    "profile:update",
  ],
  NUTRITIONIST: [
    "dashboard:read",
    "criteria:read",
    "alternatives:manage",
    "alternatives:read",
    "assessments:manage",
    "assessments:read",
    "topsis:calculate",
    "rankings:read",
    "reports:import",
    "profile:update",
  ],
  USER: [
    "dashboard:read",
    "criteria:read",
    "alternatives:read",
    "assessments:read",
    "rankings:read",
    "profile:update",
  ],
};

export function hasPermission(roles: AppRole[], permission: Permission) {
  return roles.some((role) => rolePermissions[role]?.includes(permission));
}

export function assertPermission(roles: AppRole[], permission: Permission) {
  if (!hasPermission(roles, permission)) {
    throw new Error(`Forbidden: missing permission ${permission}`);
  }
}

export { rolePermissions };
