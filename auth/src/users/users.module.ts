import { Module } from "@nestjs/common";
import { Neo4jModule } from "../neo4j/neo4j.module";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";

@Module({
  imports: [Neo4jModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
