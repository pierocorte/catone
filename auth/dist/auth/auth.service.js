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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt = __importStar(require("jsonwebtoken"));
const crypto_1 = require("crypto");
const users_service_1 = require("../users/users.service");
const authz_service_1 = require("../authz/authz.service");
let AuthService = class AuthService {
    config;
    users;
    authz;
    accessSecret;
    refreshSecret;
    accessTtlSec;
    refreshTtlSec;
    constructor(config, users, authz) {
        this.config = config;
        this.users = users;
        this.authz = authz;
        this.accessSecret = this.config.get('ACCESS_TOKEN_SECRET') ?? 'dev-access-secret';
        this.refreshSecret = this.config.get('REFRESH_TOKEN_SECRET') ?? 'dev-refresh-secret';
        this.accessTtlSec = Number(this.config.get('ACCESS_TTL_SEC') ?? 900);
        this.refreshTtlSec = Number(this.config.get('REFRESH_TTL_SEC') ?? 604800);
    }
    refreshStore = new Map();
    refreshCookieName = 'refreshToken';
    async login(email, password) {
        const verified = await this.users.verifyPassword(email, password);
        const roles = await this.authz.getRolesForUser(verified.id).catch(() => verified.roles ?? []);
        const accessToken = this.signAccessToken(verified.id, roles);
        const refreshToken = this.issueRefreshToken(verified.id);
        return { token: { accessToken, expiresIn: this.accessTtlSec }, refreshToken };
    }
    async refresh(refreshToken) {
        if (!refreshToken)
            throw new common_1.UnauthorizedException('Missing refresh token');
        let payload;
        try {
            payload = jwt.verify(refreshToken, this.refreshSecret);
        }
        catch {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
        const userId = payload?.sub;
        if (!userId)
            throw new common_1.UnauthorizedException('Invalid refresh token');
        const key = this.hashToken(refreshToken);
        const rec = this.refreshStore.get(key);
        if (!rec || Date.now() > rec.expMs) {
            this.refreshStore.delete(key);
            throw new common_1.UnauthorizedException('Refresh token revoked/expired');
        }
        this.refreshStore.delete(key);
        const roles = await this.authz.getRolesForUser(userId).catch(() => []);
        const newAccess = this.signAccessToken(userId, roles);
        const newRefresh = this.issueRefreshToken(userId);
        return { token: { accessToken: newAccess, expiresIn: this.accessTtlSec }, refreshToken: newRefresh };
    }
    async revokeRefresh(refreshToken) {
        this.refreshStore.delete(this.hashToken(refreshToken));
    }
    parseAccessToken(authorization, originalUri, originalMethod) {
        if (!authorization?.startsWith('Bearer '))
            throw new common_1.UnauthorizedException('Missing bearer token');
        const token = authorization.slice('Bearer '.length);
        let payload;
        try {
            payload = jwt.verify(token, this.accessSecret);
        }
        catch {
            throw new common_1.UnauthorizedException('Invalid access token');
        }
        const userId = payload?.sub;
        const roles = payload?.roles;
        if (!userId || !Array.isArray(roles))
            throw new common_1.UnauthorizedException('Invalid access token');
        const method = (originalMethod ?? 'GET').toUpperCase();
        const pathname = (() => {
            const uri = originalUri ?? '/';
            try {
                return new URL(uri, 'http://local').pathname;
            }
            catch {
                return uri.split('?')[0];
            }
        })();
        return { userId, roles, method, pathname };
    }
    setRefreshCookie(res, refreshToken) {
        res.cookie(this.refreshCookieName, refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            path: '/auth/refresh',
            maxAge: this.refreshTtlSec * 1000,
        });
    }
    clearRefreshCookie(res) {
        res.clearCookie(this.refreshCookieName, { path: '/auth/refresh' });
    }
    getRefreshCookie(req) {
        return req.cookies?.[this.refreshCookieName] ?? undefined;
    }
    signAccessToken(userId, roles) {
        const payload = { roles };
        return jwt.sign(payload, this.accessSecret, {
            subject: userId,
            expiresIn: this.accessTtlSec,
            jwtid: (0, crypto_1.randomUUID)(),
        });
    }
    issueRefreshToken(userId) {
        const token = jwt.sign({}, this.refreshSecret, {
            subject: userId,
            expiresIn: this.refreshTtlSec,
            jwtid: (0, crypto_1.randomUUID)(),
        });
        this.refreshStore.set(this.hashToken(token), { userId, expMs: Date.now() + this.refreshTtlSec * 1000 });
        return token;
    }
    hashToken(t) {
        return (0, crypto_1.createHash)('sha256').update(t).digest('hex');
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        users_service_1.UsersService,
        authz_service_1.AuthzService])
], AuthService);
//# sourceMappingURL=auth.service.js.map