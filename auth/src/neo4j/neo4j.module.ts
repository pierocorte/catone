import { Module, OnModuleDestroy, Inject } from "@nestjs/common";
import { Driver } from "neo4j-driver";
import { neo4jProvider, NEO4J_DRIVER } from "./neo4j.provider";

@Module({
  providers: [neo4jProvider],
  exports: [neo4jProvider],
})
export class Neo4jModule implements OnModuleDestroy {
  constructor(@Inject(NEO4J_DRIVER) private readonly driver: Driver) {}
  async onModuleDestroy() {
    await this.driver.close();
  }
}
