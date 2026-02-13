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
exports.BindingsController = void 0;
const common_1 = require("@nestjs/common");
const authz_service_1 = require("./authz.service");
let BindingsController = class BindingsController {
    authz;
    constructor(authz) {
        this.authz = authz;
    }
    listRolePermissions(roleId) {
        return this.authz.listRolePermissions(roleId);
    }
    async grantPermissionToRole(roleId, permissionId) {
        await this.authz.grantPermissionToRole(roleId, permissionId);
    }
    async revokePermissionFromRole(roleId, permissionId) {
        await this.authz.revokePermissionFromRole(roleId, permissionId);
    }
    listUserRoles(userId) {
        return this.authz.listUserRoles(userId);
    }
    async assignRoleToUser(userId, roleId) {
        await this.authz.assignRoleToUser(userId, roleId);
    }
    async unassignRoleFromUser(userId, roleId) {
        await this.authz.unassignRoleFromUser(userId, roleId);
    }
};
exports.BindingsController = BindingsController;
__decorate([
    (0, common_1.Get)('roles/:roleId/permissions'),
    __param(0, (0, common_1.Param)('roleId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BindingsController.prototype, "listRolePermissions", null);
__decorate([
    (0, common_1.Put)('roles/:roleId/permissions/:permissionId'),
    (0, common_1.HttpCode)(204),
    __param(0, (0, common_1.Param)('roleId')),
    __param(1, (0, common_1.Param)('permissionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], BindingsController.prototype, "grantPermissionToRole", null);
__decorate([
    (0, common_1.Delete)('roles/:roleId/permissions/:permissionId'),
    (0, common_1.HttpCode)(204),
    __param(0, (0, common_1.Param)('roleId')),
    __param(1, (0, common_1.Param)('permissionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], BindingsController.prototype, "revokePermissionFromRole", null);
__decorate([
    (0, common_1.Get)('users/:userId/roles'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BindingsController.prototype, "listUserRoles", null);
__decorate([
    (0, common_1.Put)('users/:userId/roles/:roleId'),
    (0, common_1.HttpCode)(204),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Param)('roleId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], BindingsController.prototype, "assignRoleToUser", null);
__decorate([
    (0, common_1.Delete)('users/:userId/roles/:roleId'),
    (0, common_1.HttpCode)(204),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Param)('roleId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], BindingsController.prototype, "unassignRoleFromUser", null);
exports.BindingsController = BindingsController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [authz_service_1.AuthzService])
], BindingsController);
//# sourceMappingURL=bindings.controller.js.map