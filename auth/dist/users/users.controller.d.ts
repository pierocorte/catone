import { UsersService } from "./users.service";
import type { components } from "../openapi";
type User = components["schemas"]["User"];
type UserCreate = components["schemas"]["UserCreate"];
type UserReplace = components["schemas"]["UserReplace"];
type UserPatch = components["schemas"]["UserPatch"];
type VerifyPasswordRequest = components["schemas"]["VerifyPasswordRequest"];
type VerifyPasswordResponse = components["schemas"]["VerifyPasswordResponse"];
export declare class UsersController {
    private readonly users;
    constructor(users: UsersService);
    list(): Promise<User[]>;
    create(body: UserCreate): Promise<User>;
    get(id: string): Promise<User>;
    replace(id: string, body: UserReplace): Promise<User>;
    patch(id: string, body: UserPatch): Promise<User>;
    del(id: string): Promise<void>;
    verifyPassword(body: VerifyPasswordRequest): Promise<VerifyPasswordResponse>;
}
export {};
