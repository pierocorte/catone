import neo4j, { Driver } from "neo4j-driver";
import { ConfigService } from "@nestjs/config";

export const NEO4J_DRIVER = "NEO4J_DRIVER";

export const neo4jProvider = {
  provide: NEO4J_DRIVER,
  inject: [ConfigService],
  useFactory: async (config: ConfigService): Promise<Driver> => {
    const uri = config.get<string>("NEO4J_URI", "neo4j://localhost:7687");
    const user = config.get<string>("NEO4J_USER", "neo4j");
    const password = config.get<string>("NEO4J_PASSWORD", "changeme");

    const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
    await driver.verifyConnectivity();
    return driver;
  },
};

