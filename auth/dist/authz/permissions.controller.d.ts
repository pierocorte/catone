import { AuthzService } from './authz.service';
import type { components } from '../openapi';
type Permission = components['schemas']['Permission'];
type PermissionCreate = components['schemas']['PermissionCreate'];
type PermissionPatch = components['schemas']['PermissionPatch'];
export declare class PermissionsController {
    private readonly authz;
    constructor(authz: AuthzService);
    list(method?: string): Promise<Permission[]>;
    create(body: PermissionCreate): Promise<Permission>;
    get(permissionId: string): Promise<Permission>;
    patch(permissionId: string, body: PermissionPatch): Promise<Permission>;
    del(permissionId: string): Promise<void>;
}
export {};
