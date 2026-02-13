import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import { UsersService } from '../users/users.service';
import { AuthzService } from '../authz/authz.service';
export declare class AuthService {
    private readonly config;
    private readonly users;
    private readonly authz;
    private accessSecret;
    private refreshSecret;
    private accessTtlSec;
    private refreshTtlSec;
    constructor(config: ConfigService, users: UsersService, authz: AuthzService);
    private readonly refreshStore;
    private readonly refreshCookieName;
    login(email: string, password: string): Promise<{
        token: {
            accessToken: string;
            expiresIn: number;
        };
        refreshToken: string;
    }>;
    refresh(refreshToken: string | undefined): Promise<{
        token: {
            accessToken: string;
            expiresIn: number;
        };
        refreshToken: string;
    }>;
    revokeRefresh(refreshToken: string): Promise<void>;
    parseAccessToken(authorization: string | undefined, originalUri?: string, originalMethod?: string): {
        userId: string;
        roles: string[];
        method: string;
        pathname: string;
    };
    setRefreshCookie(res: Response, refreshToken: string): void;
    clearRefreshCookie(res: Response): void;
    getRefreshCookie(req: Request): string | undefined;
    private signAccessToken;
    private issueRefreshToken;
    private hashToken;
}
