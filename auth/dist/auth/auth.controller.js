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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const authz_service_1 = require("../authz/authz.service");
let AuthController = class AuthController {
    auth;
    authz;
    constructor(auth, authz) {
        this.auth = auth;
        this.authz = authz;
    }
    async login(body, res) {
        const { token, refreshToken } = await this.auth.login(body.email, body.password);
        this.auth.setRefreshCookie(res, refreshToken);
        const out = {
            accessToken: token.accessToken,
            tokenType: 'Bearer',
            expiresIn: token.expiresIn,
        };
        res.json(out);
    }
    async refresh(res) {
        const refreshToken = this.auth.getRefreshCookie(res.req);
        const { token, refreshToken: newRefresh } = await this.auth.refresh(refreshToken);
        this.auth.setRefreshCookie(res, newRefresh);
        const out = {
            accessToken: token.accessToken,
            tokenType: 'Bearer',
            expiresIn: token.expiresIn,
        };
        res.json(out);
    }
    async logout(res) {
        const refreshToken = this.auth.getRefreshCookie(res.req);
        if (refreshToken)
            await this.auth.revokeRefresh(refreshToken);
        this.auth.clearRefreshCookie(res);
        res.send();
    }
    async verify(authorization, originalUri, originalMethod, res) {
        const { userId, roles, method, pathname } = this.auth.parseAccessToken(authorization, originalUri, originalMethod);
        await this.authz.authorizeOrThrow(userId, roles, method, pathname);
        res.setHeader('X-User-Id', userId);
        res.setHeader('X-Roles', roles.join(','));
        res.send();
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('auth/login'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('auth/refresh'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refresh", null);
__decorate([
    (0, common_1.Post)('auth/logout'),
    (0, common_1.HttpCode)(204),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
__decorate([
    (0, common_1.Get)('auth/verify'),
    (0, common_1.HttpCode)(204),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Headers)('x-original-uri')),
    __param(2, (0, common_1.Headers)('x-original-method')),
    __param(3, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verify", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [auth_service_1.AuthService, authz_service_1.AuthzService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map