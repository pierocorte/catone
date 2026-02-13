import type { Response } from 'express';
import { AuthService } from './auth.service';
import { AuthzService } from '../authz/authz.service';
import type { components } from '../openapi';
type LoginRequest = components['schemas']['LoginRequest'];
export declare class AuthController {
    private readonly auth;
    private readonly authz;
    constructor(auth: AuthService, authz: AuthzService);
    login(body: LoginRequest, res: Response): Promise<void>;
    refresh(res: Response): Promise<void>;
    logout(res: Response): Promise<void>;
    verify(authorization: string | undefined, originalUri: string | undefined, originalMethod: string | undefined, res: Response): Promise<void>;
}
export {};
