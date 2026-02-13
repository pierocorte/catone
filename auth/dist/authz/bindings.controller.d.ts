import { AuthzService } from './authz.service';
import type { components } from '../openapi';
type Permission = components['schemas']['Permission'];
type Role = components['schemas']['Role'];
export declare class BindingsController {
    private readonly authz;
    constructor(authz: AuthzService);
    listRolePermissions(roleId: string): Promise<Permission[]>;
    grantPermissionToRole(roleId: string, permissionId: string): Promise<void>;
    revokePermissionFromRole(roleId: string, permissionId: string): Promise<void>;
    listUserRoles(userId: string): Promise<Role[]>;
    assignRoleToUser(userId: string, roleId: string): Promise<void>;
    unassignRoleFromUser(userId: string, roleId: string): Promise<void>;
}
export {};
