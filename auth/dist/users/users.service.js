"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const neo4j_driver_1 = require("neo4j-driver");
const neo4j_provider_1 = require("../neo4j/neo4j.provider");
const crypto_1 = require("crypto");
const bcrypt = __importStar(require("bcrypt"));
let UsersService = class UsersService {
    driver;
    constructor(driver) {
        this.driver = driver;
    }
    async list() {
        const s = this.driver.session();
        try {
            const res = await s.run(`MATCH (u:User)
         OPTIONAL MATCH (u)-[:HAS_ROLE]->(r:Role)
         RETURN u, collect(r.name) AS roles
         ORDER BY u.createdAt DESC`);
            return res.records.map((rec) => this.toUser(rec.get("u").properties, rec.get("roles")));
        }
        finally {
            await s.close();
        }
    }
    async create(input) {
        const s = this.driver.session();
        const id = (0, crypto_1.randomUUID)();
        const now = new Date().toISOString();
        const passwordHash = await bcrypt.hash(input.password, 10);
        try {
            const res = await s.run(`CREATE (u:User {
           id:$id, email:$email, displayName:$displayName,
           passwordHash:$passwordHash,
           createdAt:$now, updatedAt:$now
         })
         RETURN u`, { id, email: input.email, displayName: input.displayName, passwordHash, now });
            return this.toUser(res.records[0].get("u").properties, []);
        }
        catch (e) {
            if (this.isConstraintError(e))
                throw new common_1.ConflictException("User email already exists");
            throw e;
        }
        finally {
            await s.close();
        }
    }
    async get(id) {
        const s = this.driver.session();
        try {
            const res = await s.run(`MATCH (u:User {id:$id})
         OPTIONAL MATCH (u)-[:HAS_ROLE]->(r:Role)
         RETURN u, collect(r.name) AS roles`, { id });
            if (res.records.length === 0)
                throw new common_1.NotFoundException("User not found");
            return this.toUser(res.records[0].get("u").properties, res.records[0].get("roles"));
        }
        finally {
            await s.close();
        }
    }
    async getRoles(userId) {
        const s = this.driver.session();
        try {
            const res = await s.run(`MATCH (u:User {id:$id})
         OPTIONAL MATCH (u)-[:HAS_ROLE]->(r:Role)
         RETURN u, collect(r.name) AS roles`, { id: userId });
            if (res.records.length === 0)
                throw new common_1.NotFoundException("User not found");
            const roles = res.records[0].get("roles");
            return Array.isArray(roles) ? roles.filter(Boolean) : [];
        }
        finally {
            await s.close();
        }
    }
    async replace(id, input) {
        const s = this.driver.session();
        const now = new Date().toISOString();
        const passwordHash = input.password ? await bcrypt.hash(input.password, 10) : null;
        try {
            const res = await s.run(`MATCH (u:User {id:$id})
         SET u.email=$email, u.displayName=$displayName, u.updatedAt=$now
         FOREACH (_ IN CASE WHEN $passwordHash IS NULL THEN [] ELSE [1] END |
           SET u.passwordHash = $passwordHash
         )
         WITH u
         OPTIONAL MATCH (u)-[:HAS_ROLE]->(r:Role)
         RETURN u, collect(r.name) AS roles`, { id, email: input.email, displayName: input.displayName, now, passwordHash });
            if (res.records.length === 0)
                throw new common_1.NotFoundException("User not found");
            return this.toUser(res.records[0].get("u").properties, res.records[0].get("roles"));
        }
        catch (e) {
            if (this.isConstraintError(e))
                throw new common_1.ConflictException("Email already in use");
            throw e;
        }
        finally {
            await s.close();
        }
    }
    async patch(id, input) {
        const s = this.driver.session();
        const now = new Date().toISOString();
        const sets = ["u.updatedAt=$now"];
        const params = { id, now };
        if (input.email !== undefined) {
            sets.push("u.email=$email");
            params.email = input.email;
        }
        if (input.displayName !== undefined) {
            sets.push("u.displayName=$displayName");
            params.displayName = input.displayName;
        }
        if (input.password !== undefined) {
            params.passwordHash = await bcrypt.hash(input.password, 10);
            sets.push("u.passwordHash=$passwordHash");
        }
        try {
            const res = await s.run(`MATCH (u:User {id:$id})
         SET ${sets.join(", ")}
         WITH u
         OPTIONAL MATCH (u)-[:HAS_ROLE]->(r:Role)
         RETURN u, collect(r.name) AS roles`, params);
            if (res.records.length === 0)
                throw new common_1.NotFoundException("User not found");
            return this.toUser(res.records[0].get("u").properties, res.records[0].get("roles"));
        }
        catch (e) {
            if (this.isConstraintError(e))
                throw new common_1.ConflictException("Email already in use");
            throw e;
        }
        finally {
            await s.close();
        }
    }
    async remove(id) {
        const s = this.driver.session();
        try {
            const res = await s.run(`MATCH (u:User {id:$id})
         DETACH DELETE u
         RETURN 1 AS ok`, { id });
            if (res.records.length === 0)
                throw new common_1.NotFoundException("User not found");
        }
        finally {
            await s.close();
        }
    }
    async verifyPassword(email, password) {
        const s = this.driver.session();
        try {
            const res = await s.run(`MATCH (u:User {email:$email})
         OPTIONAL MATCH (u)-[:HAS_ROLE]->(r:Role)
         RETURN u, collect(r.name) AS roles
         LIMIT 1`, { email });
            if (res.records.length === 0)
                throw new common_1.UnauthorizedException("Invalid credentials");
            const u = res.records[0].get("u").properties;
            const roles = res.records[0].get("roles");
            const passwordHash = u.passwordHash;
            if (!passwordHash)
                throw new common_1.UnauthorizedException("Invalid credentials");
            const ok = await bcrypt.compare(password, passwordHash);
            if (!ok)
                throw new common_1.UnauthorizedException("Invalid credentials");
            return {
                id: u.id,
                email: u.email,
                displayName: u.displayName,
                roles: Array.isArray(roles) ? roles.filter(Boolean) : [],
            };
        }
        finally {
            await s.close();
        }
    }
    toUser(p, roles) {
        return {
            id: p.id,
            email: p.email,
            displayName: p.displayName,
            roles: Array.isArray(roles) ? roles.filter(Boolean) : [],
            createdAt: p.createdAt,
            updatedAt: p.updatedAt,
        };
    }
    isConstraintError(e) {
        return typeof e?.code === "string" && e.code.includes("ConstraintValidationFailed");
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(neo4j_provider_1.NEO4J_DRIVER)),
    __metadata("design:paramtypes", [neo4j_driver_1.Driver])
], UsersService);
//# sourceMappingURL=users.service.js.map