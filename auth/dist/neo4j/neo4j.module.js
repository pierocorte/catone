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
exports.Neo4jModule = void 0;
const common_1 = require("@nestjs/common");
const neo4j_driver_1 = require("neo4j-driver");
const neo4j_provider_1 = require("./neo4j.provider");
let Neo4jModule = class Neo4jModule {
    driver;
    constructor(driver) {
        this.driver = driver;
    }
    async onModuleDestroy() {
        await this.driver.close();
    }
};
exports.Neo4jModule = Neo4jModule;
exports.Neo4jModule = Neo4jModule = __decorate([
    (0, common_1.Module)({
        providers: [neo4j_provider_1.neo4jProvider],
        exports: [neo4j_provider_1.neo4jProvider],
    }),
    __param(0, (0, common_1.Inject)(neo4j_provider_1.NEO4J_DRIVER)),
    __metadata("design:paramtypes", [neo4j_driver_1.Driver])
], Neo4jModule);
//# sourceMappingURL=neo4j.module.js.map