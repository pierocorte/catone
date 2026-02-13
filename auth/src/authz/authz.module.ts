import { Module } from "@nestjs/common";
import { Neo4jModule } from "../neo4j/neo4j.module";
import { AuthzService } from "./authz.service";
import { RolesController } from "./roles.controller";
import { PermissionsController } from "./permissions.controller";
import { BindingsController } from "./bindings.controller";

@Module({
    imports: [Neo4jModule],
    providers: [AuthzService],
    controllers: [RolesController, PermissionsController, BindingsController],
    exports: [AuthzService],
})
export class AuthzModule { }
