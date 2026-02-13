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
exports.PermissionsController = void 0;
const common_1 = require("@nestjs/common");
const authz_service_1 = require("./authz.service");
let PermissionsController = class PermissionsController {
    authz;
    constructor(authz) {
        this.authz = authz;
    }
    list(method) {
        return this.authz.listPermissions(method);
    }
    create(body) {
        return this.authz.createPermission(body);
    }
    get(permissionId) {
        return this.authz.getPermission(permissionId);
    }
    patch(permissionId, body) {
        return this.authz.patchPermission(permissionId, body);
    }
    async del(permissionId) {
        await this.authz.deletePermission(permissionId);
    }
};
exports.PermissionsController = PermissionsController;
__decorate([
    (0, common_1.Get)('permissions'),
    __param(0, (0, common_1.Query)('method')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PermissionsController.prototype, "list", null);
__decorate([
    (0, common_1.Post)('permissions'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PermissionsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('permissions/:permissionId'),
    __param(0, (0, common_1.Param)('permissionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PermissionsController.prototype, "get", null);
__decorate([
    (0, common_1.Patch)('permissions/:permissionId'),
    __param(0, (0, common_1.Param)('permissionId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PermissionsController.prototype, "patch", null);
__decorate([
    (0, common_1.Delete)('permissions/:permissionId'),
    (0, common_1.HttpCode)(204),
    __param(0, (0, common_1.Param)('permissionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PermissionsController.prototype, "del", null);
exports.PermissionsController = PermissionsController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [authz_service_1.AuthzService])
], PermissionsController);
//# sourceMappingURL=permissions.controller.js.map