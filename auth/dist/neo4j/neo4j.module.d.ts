import { OnModuleDestroy } from "@nestjs/common";
import { Driver } from "neo4j-driver";
export declare class Neo4jModule implements OnModuleDestroy {
    private readonly driver;
    constructor(driver: Driver);
    onModuleDestroy(): Promise<void>;
}
