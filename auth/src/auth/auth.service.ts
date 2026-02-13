// src/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { randomUUID, createHash } from 'crypto';
import { UsersService } from '../users/users.service';
import { AuthzService } from '../authz/authz.service';

type AccessTokenPayload = { roles: string[] };

@Injectable()
export class AuthService {
    private accessSecret: string;
    private refreshSecret: string;
    private accessTtlSec: number;
    private refreshTtlSec: number;

    constructor(
        private readonly config: ConfigService,
        private readonly users: UsersService,
        private readonly authz: AuthzService,
    ) {
        this.accessSecret = this.config.get<string>('ACCESS_TOKEN_SECRET') ?? 'dev-access-secret';
        this.refreshSecret = this.config.get<string>('REFRESH_TOKEN_SECRET') ?? 'dev-refresh-secret';
        this.accessTtlSec = Number(this.config.get('ACCESS_TTL_SEC') ?? 900);
        this.refreshTtlSec = Number(this.config.get('REFRESH_TTL_SEC') ?? 604800);
    }

    // In-memory refresh token store (hash -> record). In prod, persist it.
    private readonly refreshStore = new Map<string, { userId: string; expMs: number }>();

    private readonly refreshCookieName = 'refreshToken';

    async login(email: string, password: string): Promise<{ token: { accessToken: string; expiresIn: number }; refreshToken: string }> {
        const verified = await this.users.verifyPassword(email, password);

        // roles from graph (Neo4j) - you can rely on verified.roles too, but this is authoritative
        const roles = await this.authz.getRolesForUser(verified.id).catch(() => verified.roles ?? []);

        const accessToken = this.signAccessToken(verified.id, roles);
        const refreshToken = this.issueRefreshToken(verified.id);

        return { token: { accessToken, expiresIn: this.accessTtlSec }, refreshToken };
    }

    async refresh(refreshToken: string | undefined): Promise<{ token: { accessToken: string; expiresIn: number }; refreshToken: string }> {
        if (!refreshToken) throw new UnauthorizedException('Missing refresh token');

        let payload: any;
        try {
            payload = jwt.verify(refreshToken, this.refreshSecret);
        } catch {
            throw new UnauthorizedException('Invalid refresh token');
        }

        const userId = payload?.sub as string | undefined;
        if (!userId) throw new UnauthorizedException('Invalid refresh token');

        const key = this.hashToken(refreshToken);
        const rec = this.refreshStore.get(key);
        if (!rec || Date.now() > rec.expMs) {
            this.refreshStore.delete(key);
            throw new UnauthorizedException('Refresh token revoked/expired');
        }

        // rotate: invalidate old, issue new
        this.refreshStore.delete(key);

        const roles = await this.authz.getRolesForUser(userId).catch(() => []);
        const newAccess = this.signAccessToken(userId, roles);
        const newRefresh = this.issueRefreshToken(userId);

        return { token: { accessToken: newAccess, expiresIn: this.accessTtlSec }, refreshToken: newRefresh };
    }

    async revokeRefresh(refreshToken: string): Promise<void> {
        this.refreshStore.delete(this.hashToken(refreshToken));
    }

    parseAccessToken(
        authorization: string | undefined,
        originalUri?: string,
        originalMethod?: string,
    ): { userId: string; roles: string[]; method: string; pathname: string } {
        if (!authorization?.startsWith('Bearer ')) throw new UnauthorizedException('Missing bearer token');

        const token = authorization.slice('Bearer '.length);
        let payload: any;

        try {
            payload = jwt.verify(token, this.accessSecret);
        } catch {
            throw new UnauthorizedException('Invalid access token');
        }

        const userId = payload?.sub as string | undefined;
        const roles = payload?.roles as string[] | undefined;

        if (!userId || !Array.isArray(roles)) throw new UnauthorizedException('Invalid access token');

        const method = (originalMethod ?? 'GET').toUpperCase();
        const pathname = (() => {
            const uri = originalUri ?? '/';
            try {
                return new URL(uri, 'http://local').pathname;
            } catch {
                return uri.split('?')[0];
            }
        })();

        return { userId, roles, method, pathname };
    }

    // ---- Cookies ----
    setRefreshCookie(res: Response, refreshToken: string) {
        res.cookie(this.refreshCookieName, refreshToken, {
            httpOnly: true,
            secure: false, // set true behind HTTPS
            sameSite: 'lax',
            path: '/auth/refresh',
            maxAge: this.refreshTtlSec * 1000,
        });
    }

    clearRefreshCookie(res: Response) {
        res.clearCookie(this.refreshCookieName, { path: '/auth/refresh' });
    }

    getRefreshCookie(req: Request): string | undefined {
        return (req.cookies?.[this.refreshCookieName] as string | undefined) ?? undefined;
    }

    // ---- JWT ----
    private signAccessToken(userId: string, roles: string[]): string {
        const payload: AccessTokenPayload = { roles };
        return jwt.sign(payload, this.accessSecret, {
            subject: userId,
            expiresIn: this.accessTtlSec,
            jwtid: randomUUID(),
        });
    }

    private issueRefreshToken(userId: string): string {
        const token = jwt.sign({}, this.refreshSecret, {
            subject: userId,
            expiresIn: this.refreshTtlSec,
            jwtid: randomUUID(),
        });

        this.refreshStore.set(this.hashToken(token), { userId, expMs: Date.now() + this.refreshTtlSec * 1000 });
        return token;
    }

    private hashToken(t: string): string {
        return createHash('sha256').update(t).digest('hex');
    }
}
