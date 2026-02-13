"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthzService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const neo4j_driver_1 = require("neo4j-driver");
const crypto_1 = require("crypto");
const path_to_regexp_1 = require("path-to-regexp");
const neo4j_provider_1 = require("../neo4j/neo4j.provider");
let AuthzService = class AuthzService {
    driver;
    config;
    constructor(driver, config) {
        this.driver = driver;
        this.config = config;
    }
    cache = new Map();
    invalidateCache() {
        this.cache.clear();
    }
    async authorizeOrThrow(userId, roles, method, pathname) {
        if (!roles?.length)
            throw new common_1.ForbiddenException('Forbidden');
        const m = method.toUpperCase();
        const perms = await this.getCompiledPermissionsForRoles(roles);
        const allowed = perms.some(p => {
            if (p.effect !== 'ALLOW')
                return false;
            if (!(p.method === '*' || p.method === m))
                return false;
            return Boolean(p.matcher(pathname));
        });
        if (!allowed)
            throw new common_1.ForbiddenException('Forbidden');
    }
    async getRolesForUser(userId) {
        const s = this.driver.session();
        try {
            const res = await s.run(`MATCH (u:User {id:$userId})
         OPTIONAL MATCH (u)-[:HAS_ROLE]->(r:Role)
         RETURN u, collect(r.name) AS roles`, { userId });
            if (res.records.length === 0)
                throw new common_1.NotFoundException('User not found');
            const roles = res.records[0].get('roles');
            return (roles ?? []).filter(Boolean);
        }
        finally {
            await s.close();
        }
    }
    async getCompiledPermissionsForRoles(roleNames) {
        const out = [];
        for (const roleName of roleNames) {
            const perms = await this.getCompiledPermsForRole(roleName);
            out.push(...perms);
        }
        return out;
    }
    async getCompiledPermsForRole(roleName) {
        const ttlMs = Number(this.config.get('AUTHZ_CACHE_TTL_MS', 30000));
        const now = Date.now();
        const cached = this.cache.get(roleName);
        if (cached && cached.exp > now)
            return cached.perms;
        const s = this.driver.session();
        try {
            const res = await s.run(`MATCH (r:Role {name:$roleName})-[:GRANTS]->(p:Permission)
         RETURN p.id AS id, p.method AS method, p.pathPattern AS pathPattern, p.effect AS effect`, { roleName });
            const compiled = res.records.map(rec => {
                const row = {
                    id: rec.get('id'),
                    method: String(rec.get('method')).toUpperCase(),
                    pathPattern: String(rec.get('pathPattern')),
                    effect: rec.get('effect'),
                };
                return { ...row, matcher: (0, path_to_regexp_1.match)(row.pathPattern, { end: true }) };
            });
            this.cache.set(roleName, { exp: now + ttlMs, perms: compiled });
            return compiled;
        }
        finally {
            await s.close();
        }
    }
    async listRoles() {
        const s = this.driver.session();
        try {
            const res = await s.run(`MATCH (r:Role) RETURN r ORDER BY r.name ASC`);
            return res.records.map(r => this.toRole(r.get('r').properties));
        }
        finally {
            await s.close();
        }
    }
    async createRole(input) {
        const s = this.driver.session();
        const id = (0, crypto_1.randomUUID)();
        const now = new Date().toISOString();
        try {
            const res = await s.run(`CREATE (r:Role {id:$id, name:$name, description:$description, createdAt:$now, updatedAt:$now})
         RETURN r`, {
                id,
                name: input.name,
                description: input.description ?? null,
                now,
            });
            this.invalidateCache();
            return this.toRole(res.records[0].get('r').properties);
        }
        catch (e) {
            if (this.isConstraintError(e))
                throw new common_1.ConflictException('Role already exists');
            throw e;
        }
        finally {
            await s.close();
        }
    }
    async getRole(roleId) {
        const s = this.driver.session();
        try {
            const res = await s.run(`MATCH (r:Role {id:$id}) RETURN r`, { id: roleId });
            if (res.records.length === 0)
                throw new common_1.NotFoundException('Role not found');
            return this.toRole(res.records[0].get('r').properties);
        }
        finally {
            await s.close();
        }
    }
    async patchRole(roleId, input) {
        const s = this.driver.session();
        const now = new Date().toISOString();
        const sets = ['r.updatedAt = $now'];
        const params = { id: roleId, now };
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
            if (res.records.length === 0)
                throw new common_1.NotFoundException('Role not found');
            this.invalidateCache();
            return this.toRole(res.records[0].get('r').properties);
        }
        catch (e) {
            if (this.isConstraintError(e))
                throw new common_1.ConflictException('Role name already in use');
            throw e;
        }
        finally {
            await s.close();
        }
    }
    async deleteRole(roleId) {
        const s = this.driver.session();
        try {
            const res = await s.run(`MATCH (r:Role {id:$id})
         WITH r
         DETACH DELETE r
         RETURN 1 AS deleted`, { id: roleId });
            if (res.records.length === 0)
                throw new common_1.NotFoundException('Role not found');
            this.invalidateCache();
        }
        finally {
            await s.close();
        }
    }
    async listPermissions(method) {
        const s = this.driver.session();
        try {
            const res = method
                ? await s.run(`MATCH (p:Permission) WHERE p.method = $m RETURN p ORDER BY p.pathPattern ASC`, {
                    m: method.toUpperCase(),
                })
                : await s.run(`MATCH (p:Permission) RETURN p ORDER BY p.pathPattern ASC`);
            return res.records.map(r => this.toPermission(r.get('p').properties));
        }
        finally {
            await s.close();
        }
    }
    async createPermission(input) {
        const s = this.driver.session();
        const id = (0, crypto_1.randomUUID)();
        const now = new Date().toISOString();
        const method = (input.method ?? '').toUpperCase();
        const pathPattern = this.normalizePathPattern(input.pathPattern);
        const effect = (input.effect ?? 'ALLOW');
        this.assertCompilablePathPattern(pathPattern);
        const exists = await this.findPermissionByMethodAndPath(method, pathPattern);
        if (exists)
            throw new common_1.ConflictException('Permission already exists for method+pathPattern');
        try {
            const res = await s.run(`CREATE (p:Permission {
           id:$id,
           method:$method,
           pathPattern:$pathPattern,
           effect:$effect,
           description:$description,
           createdAt:$now,
           updatedAt:$now
         })
         RETURN p`, {
                id,
                method,
                pathPattern,
                effect,
                description: input.description ?? null,
                now,
            });
            this.invalidateCache();
            return this.toPermission(res.records[0].get('p').properties);
        }
        finally {
            await s.close();
        }
    }
    async getPermission(permissionId) {
        const s = this.driver.session();
        try {
            const res = await s.run(`MATCH (p:Permission {id:$id}) RETURN p`, { id: permissionId });
            if (res.records.length === 0)
                throw new common_1.NotFoundException('Permission not found');
            return this.toPermission(res.records[0].get('p').properties);
        }
        finally {
            await s.close();
        }
    }
    async patchPermission(permissionId, input) {
        const s = this.driver.session();
        const now = new Date().toISOString();
        const sets = ['p.updatedAt = $now'];
        const params = { id: permissionId, now };
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
            params.effect = input.effect;
            sets.push('p.effect = $effect');
        }
        if (input.description !== undefined) {
            params.description = input.description;
            sets.push('p.description = $description');
        }
        if (params.method || params.pathPattern) {
            const current = await this.getPermission(permissionId);
            const newMethod = (params.method ?? current.method).toUpperCase();
            const newPath = params.pathPattern ?? current.pathPattern;
            const dup = await this.findPermissionByMethodAndPath(newMethod, newPath, permissionId);
            if (dup)
                throw new common_1.ConflictException('Permission already exists for method+pathPattern');
        }
        const res = await s.run(`MATCH (p:Permission {id:$id}) SET ${sets.join(', ')} RETURN p`, params);
        await s.close();
        if (res.records.length === 0)
            throw new common_1.NotFoundException('Permission not found');
        this.invalidateCache();
        return this.toPermission(res.records[0].get('p').properties);
    }
    async deletePermission(permissionId) {
        const s = this.driver.session();
        try {
            const res = await s.run(`MATCH (p:Permission {id:$id})
         WITH p
         DETACH DELETE p
         RETURN 1 AS deleted`, { id: permissionId });
            if (res.records.length === 0)
                throw new common_1.NotFoundException('Permission not found');
            this.invalidateCache();
        }
        finally {
            await s.close();
        }
    }
    async listRolePermissions(roleId) {
        const s = this.driver.session();
        try {
            const res = await s.run(`MATCH (r:Role {id:$roleId})
         OPTIONAL MATCH (r)-[:GRANTS]->(p:Permission)
         RETURN r, collect(p) AS perms`, { roleId });
            if (res.records.length === 0)
                throw new common_1.NotFoundException('Role not found');
            const perms = res.records[0].get('perms');
            return (perms ?? []).filter(Boolean).map(p => this.toPermission(p.properties));
        }
        finally {
            await s.close();
        }
    }
    async grantPermissionToRole(roleId, permissionId) {
        const s = this.driver.session();
        try {
            const res = await s.run(`MATCH (r:Role {id:$roleId})
         MATCH (p:Permission {id:$permissionId})
         MERGE (r)-[:GRANTS]->(p)
         RETURN r, p`, { roleId, permissionId });
            if (res.records.length === 0)
                throw new common_1.NotFoundException('Role or Permission not found');
            this.invalidateCache();
        }
        finally {
            await s.close();
        }
    }
    async revokePermissionFromRole(roleId, permissionId) {
        const s = this.driver.session();
        try {
            const res = await s.run(`MATCH (r:Role {id:$roleId})-[rel:GRANTS]->(p:Permission {id:$permissionId})
         DELETE rel
         RETURN 1 AS deleted`, { roleId, permissionId });
            if (res.records.length === 0)
                throw new common_1.NotFoundException('Binding not found');
            this.invalidateCache();
        }
        finally {
            await s.close();
        }
    }
    async listUserRoles(userId) {
        const s = this.driver.session();
        try {
            const res = await s.run(`MATCH (u:User {id:$userId})
         OPTIONAL MATCH (u)-[:HAS_ROLE]->(r:Role)
         RETURN u, collect(r) AS roles`, { userId });
            if (res.records.length === 0)
                throw new common_1.NotFoundException('User not found');
            const roles = res.records[0].get('roles');
            return (roles ?? []).filter(Boolean).map(r => this.toRole(r.properties));
        }
        finally {
            await s.close();
        }
    }
    async assignRoleToUser(userId, roleId) {
        const s = this.driver.session();
        try {
            const res = await s.run(`MATCH (u:User {id:$userId})
         MATCH (r:Role {id:$roleId})
         MERGE (u)-[:HAS_ROLE]->(r)
         RETURN u, r`, { userId, roleId });
            if (res.records.length === 0)
                throw new common_1.NotFoundException('User or Role not found');
        }
        finally {
            await s.close();
        }
    }
    async unassignRoleFromUser(userId, roleId) {
        const s = this.driver.session();
        try {
            const res = await s.run(`MATCH (u:User {id:$userId})-[rel:HAS_ROLE]->(r:Role {id:$roleId})
         DELETE rel
         RETURN 1 AS deleted`, { userId, roleId });
            if (res.records.length === 0)
                throw new common_1.NotFoundException('Binding not found');
        }
        finally {
            await s.close();
        }
    }
    toRole(p) {
        return {
            id: p.id,
            name: p.name,
            description: p.description ?? undefined,
            createdAt: p.createdAt,
            updatedAt: p.updatedAt,
        };
    }
    toPermission(p) {
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
    normalizePathPattern(s) {
        const trimmed = (s ?? '').trim();
        if (!trimmed)
            throw new common_1.BadRequestException('pathPattern is required');
        const out = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
        return out;
    }
    assertCompilablePathPattern(pathPattern) {
        try {
            (0, path_to_regexp_1.match)(pathPattern, { end: true });
        }
        catch {
            throw new common_1.BadRequestException('Invalid pathPattern');
        }
    }
    isConstraintError(e) {
        return typeof e?.code === 'string' && e.code.includes('ConstraintValidationFailed');
    }
    async findPermissionByMethodAndPath(method, pathPattern, excludeId) {
        const s = this.driver.session();
        try {
            const res = await s.run(`MATCH (p:Permission {method:$method, pathPattern:$pathPattern})
         ${excludeId ? 'WHERE p.id <> $excludeId' : ''}
         RETURN p.id AS id
         LIMIT 1`, excludeId ? { method, pathPattern, excludeId } : { method, pathPattern });
            return res.records.length > 0;
        }
        finally {
            await s.close();
        }
    }
};
exports.AuthzService = AuthzService;
exports.AuthzService = AuthzService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(neo4j_provider_1.NEO4J_DRIVER)),
    __metadata("design:paramtypes", [neo4j_driver_1.Driver,
        config_1.ConfigService])
], AuthzService);
//# sourceMappingURL=authz.service.js.map