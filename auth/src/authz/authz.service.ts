// src/authz/authz.service.ts
import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    Inject,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Driver } from 'neo4j-driver';
import { randomUUID } from 'crypto';
import { match, MatchFunction } from 'path-to-regexp';

import { NEO4J_DRIVER } from '../neo4j/neo4j.provider';
import type { components } from '../openapi';

type Role = components['schemas']['Role'];
type RoleCreate = components['schemas']['RoleCreate'];
type RolePatch = components['schemas']['RolePatch'];

type Permission = components['schemas']['Permission'];
type PermissionCreate = components['schemas']['PermissionCreate'];
type PermissionPatch = components['schemas']['PermissionPatch'];

type PermissionRow = {
    id: string;
    method: string; // "GET" | ... | "*"
    pathPattern: string;
    effect: 'ALLOW';
};

type CompiledPerm = PermissionRow & { matcher: MatchFunction<object> };

@Injectable()
export class AuthzService {
    constructor(
        @Inject(NEO4J_DRIVER) private readonly driver: Driver,
        private readonly config: ConfigService,
    ) { }

    // Cache compiled permissions per roleName
    private readonly cache = new Map<string, { exp: number; perms: CompiledPerm[] }>();

    invalidateCache() {
        this.cache.clear();
    }

    // ---------- Runtime Authorization ----------
    async authorizeOrThrow(userId: string, roles: string[], method: string, pathname: string): Promise<void> {
        if (!roles?.length) throw new ForbiddenException('Forbidden');

        const m = method.toUpperCase();
        const perms = await this.getCompiledPermissionsForRoles(roles);

        const allowed = perms.some(p => {
            if (p.effect !== 'ALLOW') return false;
            if (!(p.method === '*' || p.method === m)) return false;
            return Boolean(p.matcher(pathname));
        });

        if (!allowed) throw new ForbiddenException('Forbidden');
    }

    async getRolesForUser(userId: string): Promise<string[]> {
        const s = this.driver.session();
        try {
            const res = await s.run(
                `MATCH (u:User {id:$userId})
         OPTIONAL MATCH (u)-[:HAS_ROLE]->(r:Role)
         RETURN u, collect(r.name) AS roles`,
                { userId },
            );
            if (res.records.length === 0) throw new NotFoundException('User not found');
            const roles = res.records[0].get('roles') as string[];
            return (roles ?? []).filter(Boolean);
        } finally {
            await s.close();
        }
    }

    private async getCompiledPermissionsForRoles(roleNames: string[]): Promise<CompiledPerm[]> {
        const out: CompiledPerm[] = [];
        for (const roleName of roleNames) {
            const perms = await this.getCompiledPermsForRole(roleName);
            out.push(...perms);
        }
        return out;
    }

    private async getCompiledPermsForRole(roleName: string): Promise<CompiledPerm[]> {
        const ttlMs = Number(this.config.get('AUTHZ_CACHE_TTL_MS', 30000));
        const now = Date.now();
        const cached = this.cache.get(roleName);
        if (cached && cached.exp > now) return cached.perms;

        const s = this.driver.session();
        try {
            const res = await s.run(
                `MATCH (r:Role {name:$roleName})-[:GRANTS]->(p:Permission)
         RETURN p.id AS id, p.method AS method, p.pathPattern AS pathPattern, p.effect AS effect`,
                { roleName },
            );

            const compiled: CompiledPerm[] = res.records.map(rec => {
                const row: PermissionRow = {
                    id: rec.get('id'),
                    method: String(rec.get('method')).toUpperCase(),
                    pathPattern: String(rec.get('pathPattern')),
                    effect: rec.get('effect'),
                };
                return { ...row, matcher: match(row.pathPattern, { end: true }) };
            });

            this.cache.set(roleName, { exp: now + ttlMs, perms: compiled });
            return compiled;
        } finally {
            await s.close();
        }
    }

    // ---------- Roles CRUD ----------
    async listRoles(): Promise<Role[]> {
        const s = this.driver.session();
        try {
            const res = await s.run(`MATCH (r:Role) RETURN r ORDER BY r.name ASC`);
            return res.records.map(r => this.toRole(r.get('r').properties));
        } finally {
            await s.close();
        }
    }

    async createRole(input: RoleCreate): Promise<Role> {
        const s = this.driver.session();
        const id = randomUUID();
        const now = new Date().toISOString();

        try {
            const res = await s.run(
                `CREATE (r:Role {id:$id, name:$name, description:$description, createdAt:$now, updatedAt:$now})
         RETURN r`,
                {
                    id,
                    name: input.name,
                    description: input.description ?? null,
                    now,
                },
            );
            this.invalidateCache();
            return this.toRole(res.records[0].get('r').properties);
        } catch (e: any) {
            if (this.isConstraintError(e)) throw new ConflictException('Role already exists');
            throw e;
        } finally {
            await s.close();
        }
    }

    async getRole(roleId: string): Promise<Role> {
        const s = this.driver.session();
        try {
            const res = await s.run(`MATCH (r:Role {id:$id}) RETURN r`, { id: roleId });
            if (res.records.length === 0) throw new NotFoundException('Role not found');
            return this.toRole(res.records[0].get('r').properties);
        } finally {
            await s.close();
        }
    }

    async patchRole(roleId: string, input: RolePatch): Promise<Role> {
        const s = this.driver.session();
        const now = new Date().toISOString();

        const sets: string[] = ['r.updatedAt = $now'];
        const params: any = { id: roleId, now };

        if (input.name !== undefined) {
            sets.push('r.name = $name');
            params.name = input.name;
        }
        if (input.description !== undefined) {
            sets.push('r.description = $description');
            params.description = input.description;
        }

        try {
            const res = await s.run(`MATCH (r:Role {id:$id}) SET ${sets.join(', ')} RETURN r`, params);
            if (res.records.length === 0) throw new NotFoundException('Role not found');
            this.invalidateCache();
            return this.toRole(res.records[0].get('r').properties);
        } catch (e: any) {
            if (this.isConstraintError(e)) throw new ConflictException('Role name already in use');
            throw e;
        } finally {
            await s.close();
        }
    }

    async deleteRole(roleId: string): Promise<void> {
        const s = this.driver.session();
        try {
            const res = await s.run(
                `MATCH (r:Role {id:$id})
         WITH r
         DETACH DELETE r
         RETURN 1 AS deleted`,
                { id: roleId },
            );
            if (res.records.length === 0) throw new NotFoundException('Role not found');
            this.invalidateCache();
        } finally {
            await s.close();
        }
    }

    // ---------- Permissions CRUD ----------
    async listPermissions(method?: string): Promise<Permission[]> {
        const s = this.driver.session();
        try {
            const res = method
                ? await s.run(`MATCH (p:Permission) WHERE p.method = $m RETURN p ORDER BY p.pathPattern ASC`, {
                    m: method.toUpperCase(),
                })
                : await s.run(`MATCH (p:Permission) RETURN p ORDER BY p.pathPattern ASC`);

            return res.records.map(r => this.toPermission(r.get('p').properties));
        } finally {
            await s.close();
        }
    }

    async createPermission(input: PermissionCreate): Promise<Permission> {
        const s = this.driver.session();
        const id = randomUUID();
        const now = new Date().toISOString();

        const method = (input.method ?? '').toUpperCase();
        const pathPattern = this.normalizePathPattern(input.pathPattern);
        const effect = (input.effect ?? 'ALLOW') as 'ALLOW';

        // validate pattern (avoid storing junk)
        this.assertCompilablePathPattern(pathPattern);

        // optional uniqueness check on (method,pathPattern) to prevent duplicates
        const exists = await this.findPermissionByMethodAndPath(method, pathPattern);
        if (exists) throw new ConflictException('Permission already exists for method+pathPattern');

        try {
            const res = await s.run(
                `CREATE (p:Permission {
           id:$id,
           method:$method,
           pathPattern:$pathPattern,
           effect:$effect,
           description:$description,
           createdAt:$now,
           updatedAt:$now
         })
         RETURN p`,
                {
                    id,
                    method,
                    pathPattern,
                    effect,
                    description: input.description ?? null,
                    now,
                },
            );
            this.invalidateCache();
            return this.toPermission(res.records[0].get('p').properties);
        } finally {
            await s.close();
        }
    }

    async getPermission(permissionId: string): Promise<Permission> {
        const s = this.driver.session();
        try {
            const res = await s.run(`MATCH (p:Permission {id:$id}) RETURN p`, { id: permissionId });
            if (res.records.length === 0) throw new NotFoundException('Permission not found');
            return this.toPermission(res.records[0].get('p').properties);
        } finally {
            await s.close();
        }
    }

    async patchPermission(permissionId: string, input: PermissionPatch): Promise<Permission> {
        const s = this.driver.session();
        const now = new Date().toISOString();

        const sets: string[] = ['p.updatedAt = $now'];
        const params: any = { id: permissionId, now };

        if (input.method !== undefined) {
            params.method = input.method.toUpperCase();
            sets.push('p.method = $method');
        }
        if (input.pathPattern !== undefined) {
            params.pathPattern = this.normalizePathPattern(input.pathPattern);
            this.assertCompilablePathPattern(params.pathPattern);
            sets.push('p.pathPattern = $pathPattern');
        }
        if (input.effect !== undefined) {
            // currently only ALLOW is supported
            params.effect = input.effect;
            sets.push('p.effect = $effect');
        }
        if (input.description !== undefined) {
            params.description = input.description;
            sets.push('p.description = $description');
        }

        // if method/pathPattern are changing, enforce uniqueness (best effort)
        if (params.method || params.pathPattern) {
            const current = await this.getPermission(permissionId);
            const newMethod = (params.method ?? current.method).toUpperCase();
            const newPath = params.pathPattern ?? current.pathPattern;
            const dup = await this.findPermissionByMethodAndPath(newMethod, newPath, permissionId);
            if (dup) throw new ConflictException('Permission already exists for method+pathPattern');
        }

        const res = await s.run(`MATCH (p:Permission {id:$id}) SET ${sets.join(', ')} RETURN p`, params);
        await s.close();

        if (res.records.length === 0) throw new NotFoundException('Permission not found');
        this.invalidateCache();
        return this.toPermission(res.records[0].get('p').properties);
    }

    async deletePermission(permissionId: string): Promise<void> {
        const s = this.driver.session();
        try {
            const res = await s.run(
                `MATCH (p:Permission {id:$id})
         WITH p
         DETACH DELETE p
         RETURN 1 AS deleted`,
                { id: permissionId },
            );
            if (res.records.length === 0) throw new NotFoundException('Permission not found');
            this.invalidateCache();
        } finally {
            await s.close();
        }
    }

    // ---------- Bindings: role ↔ permission ----------
    async listRolePermissions(roleId: string): Promise<Permission[]> {
        const s = this.driver.session();
        try {
            const res = await s.run(
                `MATCH (r:Role {id:$roleId})
         OPTIONAL MATCH (r)-[:GRANTS]->(p:Permission)
         RETURN r, collect(p) AS perms`,
                { roleId },
            );
            if (res.records.length === 0) throw new NotFoundException('Role not found');

            const perms = res.records[0].get('perms') as any[];
            return (perms ?? []).filter(Boolean).map(p => this.toPermission(p.properties));
        } finally {
            await s.close();
        }
    }

    async grantPermissionToRole(roleId: string, permissionId: string): Promise<void> {
        const s = this.driver.session();
        try {
            const res = await s.run(
                `MATCH (r:Role {id:$roleId})
         MATCH (p:Permission {id:$permissionId})
         MERGE (r)-[:GRANTS]->(p)
         RETURN r, p`,
                { roleId, permissionId },
            );
            if (res.records.length === 0) throw new NotFoundException('Role or Permission not found');
            this.invalidateCache();
        } finally {
            await s.close();
        }
    }

    async revokePermissionFromRole(roleId: string, permissionId: string): Promise<void> {
        const s = this.driver.session();
        try {
            const res = await s.run(
                `MATCH (r:Role {id:$roleId})-[rel:GRANTS]->(p:Permission {id:$permissionId})
         DELETE rel
         RETURN 1 AS deleted`,
                { roleId, permissionId },
            );
            if (res.records.length === 0) throw new NotFoundException('Binding not found');
            this.invalidateCache();
        } finally {
            await s.close();
        }
    }

    // ---------- Bindings: user ↔ role ----------
    async listUserRoles(userId: string): Promise<Role[]> {
        const s = this.driver.session();
        try {
            const res = await s.run(
                `MATCH (u:User {id:$userId})
         OPTIONAL MATCH (u)-[:HAS_ROLE]->(r:Role)
         RETURN u, collect(r) AS roles`,
                { userId },
            );
            if (res.records.length === 0) throw new NotFoundException('User not found');

            const roles = res.records[0].get('roles') as any[];
            return (roles ?? []).filter(Boolean).map(r => this.toRole(r.properties));
        } finally {
            await s.close();
        }
    }

    async assignRoleToUser(userId: string, roleId: string): Promise<void> {
        const s = this.driver.session();
        try {
            const res = await s.run(
                `MATCH (u:User {id:$userId})
         MATCH (r:Role {id:$roleId})
         MERGE (u)-[:HAS_ROLE]->(r)
         RETURN u, r`,
                { userId, roleId },
            );
            if (res.records.length === 0) throw new NotFoundException('User or Role not found');
            // roles change affects JWT at next login/refresh; cache is role->perms, so no need to clear
        } finally {
            await s.close();
        }
    }

    async unassignRoleFromUser(userId: string, roleId: string): Promise<void> {
        const s = this.driver.session();
        try {
            const res = await s.run(
                `MATCH (u:User {id:$userId})-[rel:HAS_ROLE]->(r:Role {id:$roleId})
         DELETE rel
         RETURN 1 AS deleted`,
                { userId, roleId },
            );
            if (res.records.length === 0) throw new NotFoundException('Binding not found');
        } finally {
            await s.close();
        }
    }

    // ---------- Helpers ----------
    private toRole(p: any): Role {
        return {
            id: p.id,
            name: p.name,
            description: p.description ?? undefined,
            createdAt: p.createdAt,
            updatedAt: p.updatedAt,
        };
    }

    private toPermission(p: any): Permission {
        return {
            id: p.id,
            method: p.method,
            pathPattern: p.pathPattern,
            effect: p.effect,
            description: p.description ?? undefined,
            createdAt: p.createdAt,
            updatedAt: p.updatedAt,
        };
    }

    private normalizePathPattern(s: string): string {
        const trimmed = (s ?? '').trim();
        if (!trimmed) throw new BadRequestException('pathPattern is required');
        const out = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
        return out;
    }

    private assertCompilablePathPattern(pathPattern: string) {
        try {
            // compile check; throws on invalid patterns
            match(pathPattern, { end: true });
        } catch {
            throw new BadRequestException('Invalid pathPattern');
        }
    }

    private isConstraintError(e: any): boolean {
        return typeof e?.code === 'string' && e.code.includes('ConstraintValidationFailed');
    }

    private async findPermissionByMethodAndPath(
        method: string,
        pathPattern: string,
        excludeId?: string,
    ): Promise<boolean> {
        const s = this.driver.session();
        try {
            const res = await s.run(
                `MATCH (p:Permission {method:$method, pathPattern:$pathPattern})
         ${excludeId ? 'WHERE p.id <> $excludeId' : ''}
         RETURN p.id AS id
         LIMIT 1`,
                excludeId ? { method, pathPattern, excludeId } : { method, pathPattern },
            );
            return res.records.length > 0;
        } finally {
            await s.close();
        }
    }
}
