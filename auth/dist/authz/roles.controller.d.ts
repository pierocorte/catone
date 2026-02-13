import { AuthzService } from './authz.service';
import type { components } from '../openapi';
type Role = components['schemas']['Role'];
type RoleCreate = components['schemas']['RoleCreate'];
type RolePatch = components['schemas']['RolePatch'];
export declare class RolesController {
    private readonly authz;
    constructor(authz: AuthzService);
    list(): Promise<Role[]>;
    create(body: RoleCreate): Promise<Role>;
    get(roleId: string): Promise<Role>;
    patch(roleId: string, body: RolePatch): Promise<Role>;
    del(roleId: string): Promise<void>;
}
export {};
