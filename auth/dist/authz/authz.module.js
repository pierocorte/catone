"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthzModule = void 0;
const common_1 = require("@nestjs/common");
const neo4j_module_1 = require("../neo4j/neo4j.module");
const authz_service_1 = require("./authz.service");
const roles_controller_1 = require("./roles.controller");
const permissions_controller_1 = require("./permissions.controller");
const bindings_controller_1 = require("./bindings.controller");
let AuthzModule = class AuthzModule {
};
exports.AuthzModule = AuthzModule;
exports.AuthzModule = AuthzModule = __decorate([
    (0, common_1.Module)({
        imports: [neo4j_module_1.Neo4jModule],
        providers: [authz_service_1.AuthzService],
        controllers: [roles_controller_1.RolesController, permissions_controller_1.PermissionsController, bindings_controller_1.BindingsController],
        exports: [authz_service_1.AuthzService],
    })
], AuthzModule);
//# sourceMappingURL=authz.module.js.map