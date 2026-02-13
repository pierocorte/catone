// src/auth/auth.controller.ts
import { Body, Controller, Get, Headers, HttpCode, Post, Res } from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { AuthzService } from '../authz/authz.service';
import type { components } from '../openapi';

type LoginRequest = components['schemas']['LoginRequest'];
type TokenResponse = components['schemas']['TokenResponse'];

@Controller()
export class AuthController {
  constructor(private readonly auth: AuthService, private readonly authz: AuthzService) {}

  @Post('auth/login')
  @HttpCode(200)
  async login(@Body() body: LoginRequest, @Res() res: Response): Promise<void> {
    const { token, refreshToken } = await this.auth.login(body.email, body.password);

    this.auth.setRefreshCookie(res, refreshToken);

    const out: TokenResponse = {
      accessToken: token.accessToken,
      tokenType: 'Bearer',
      expiresIn: token.expiresIn,
    };

    res.json(out);
  }

  @Post('auth/refresh')
  @HttpCode(200)
  async refresh(@Res() res: Response): Promise<void> {
    const refreshToken = this.auth.getRefreshCookie(res.req);

    const { token, refreshToken: newRefresh } = await this.auth.refresh(refreshToken);
    this.auth.setRefreshCookie(res, newRefresh);

    const out: TokenResponse = {
      accessToken: token.accessToken,
      tokenType: 'Bearer',
      expiresIn: token.expiresIn,
    };

    res.json(out);
  }

  @Post('auth/logout')
  @HttpCode(204)
  async logout(@Res() res: Response): Promise<void> {
    const refreshToken = this.auth.getRefreshCookie(res.req);
    if (refreshToken) await this.auth.revokeRefresh(refreshToken);
    this.auth.clearRefreshCookie(res);
    res.send();
  }

  @Get('auth/verify')
  @HttpCode(204)
  async verify(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-original-uri') originalUri: string | undefined,
    @Headers('x-original-method') originalMethod: string | undefined,
    @Res() res: Response,
  ): Promise<void> {
    const { userId, roles, method, pathname } = this.auth.parseAccessToken(authorization, originalUri, originalMethod);

    await this.authz.authorizeOrThrow(userId, roles, method, pathname);

    res.setHeader('X-User-Id', userId);
    res.setHeader('X-Roles', roles.join(','));
    res.send();
  }
}
