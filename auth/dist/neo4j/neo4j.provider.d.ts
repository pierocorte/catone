import { Driver } from "neo4j-driver";
import { ConfigService } from "@nestjs/config";
export declare const NEO4J_DRIVER = "NEO4J_DRIVER";
export declare const neo4jProvider: {
    provide: string;
    inject: (typeof ConfigService)[];
    useFactory: (config: ConfigService) => Promise<Driver>;
};
