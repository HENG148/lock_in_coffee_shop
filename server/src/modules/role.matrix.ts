export type Role = "admin" | "manager" | "cashier";

export const ROLE_PERMISSIONS: Record<Exclude<Role, "admin">, readonly string[]> = {
  manager: [
    "users:list",
    "users:read",
    "users:create-cashier",
    "users:update-own"
  ],
  cashier: ["users:read-own", "users:update-own"],
} as const;

export function hasPermission(role: Role, permission: string): boolean{
  if (role === "admin") return true;
  return ROLE_PERMISSIONS[role].includes(permission);
}

export function getPermissionForRole(role: Role): readonly string[]{
  if (role === "admin") {
    return [
      ...new Set([
        ...ROLE_PERMISSIONS.manager,
        ...ROLE_PERMISSIONS.cashier,
        "users:create-any-role",
        "users:update-role",
        "users:deactivate",
      ])
    ]
  }
  return ROLE_PERMISSIONS[role];
}

export function getFullMatrix(): Record<Role, readonly string[]>{
  return {
    admin: getPermissionForRole('admin'),
    manager: ROLE_PERMISSIONS.manager,
    cashier: ROLE_PERMISSIONS.cashier,
    // barista: ROLE_PERMISSIONS.barista,
  }
}