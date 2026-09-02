import { getFullMatrix, getPermissionForRole, type Role } from "../role.matrix.js";

export class RoleService {
  getMyPermission(role: Role) {
    return { role, permission: getPermissionForRole(role) };
  }

  getFullMatrix() {
    return getFullMatrix();
  }
}