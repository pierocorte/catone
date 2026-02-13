import { Driver } from "neo4j-driver";
import type { components } from "../openapi";
type User = components["schemas"]["User"];
type UserCreate = components["schemas"]["UserCreate"];
type UserReplace = components["schemas"]["UserReplace"];
type UserPatch = components["schemas"]["UserPatch"];
type VerifyPasswordResponse = components["schemas"]["VerifyPasswordResponse"];
export declare class UsersService {
    private readonly driver;
    constructor(driver: Driver);
    list(): Promise<User[]>;
    create(input: UserCreate): Promise<User>;
    get(id: string): Promise<User>;
    getRoles(userId: string): Promise<string[]>;
    replace(id: string, input: UserReplace): Promise<User>;
    patch(id: string, input: UserPatch): Promise<User>;
    remove(id: string): Promise<void>;
    verifyPassword(email: string, password: string): Promise<VerifyPasswordResponse>;
    private toUser;
    private isConstraintError;
}
export {};
