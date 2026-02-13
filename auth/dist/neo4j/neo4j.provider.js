"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.neo4jProvider = exports.NEO4J_DRIVER = void 0;
const neo4j_driver_1 = __importDefault(require("neo4j-driver"));
const config_1 = require("@nestjs/config");
exports.NEO4J_DRIVER = "NEO4J_DRIVER";
exports.neo4jProvider = {
    provide: exports.NEO4J_DRIVER,
    inject: [config_1.ConfigService],
    useFactory: async (config) => {
        const uri = config.get("NEO4J_URI", "neo4j://localhost:7687");
        const user = config.get("NEO4J_USER", "neo4j");
        const password = config.get("NEO4J_PASSWORD", "changeme");
        const driver = neo4j_driver_1.default.driver(uri, neo4j_driver_1.default.auth.basic(user, password));
        await driver.verifyConnectivity();
        return driver;
    },
};
//# sourceMappingURL=neo4j.provider.js.map