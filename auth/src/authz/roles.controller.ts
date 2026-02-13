import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post } from '@nestjs/common';
import { AuthzService } from './authz.service';
import type { components } from '../openapi';

type Role = components['schemas']['Role'];
type RoleCreate = components['schemas']['RoleCreate'];
type RolePatch = components['schemas']['RolePatch'];

@Controller()
export class RolesController {
  constructor(private readonly authz: AuthzService) {}

  @Get('roles')
  list(): Promise<Role[]> {
    return this.authz.listRoles();
  }

  @Post('roles')
  create(@Body() body: RoleCreate): Promise<Role> {
    return this.authz.createRole(body);
  }

  @Get('roles/:roleId')
  get(@Param('roleId') roleId: string): Promise<Role> {
    return this.authz.getRole(roleId);
  }

  @Patch('roles/:roleId')
  patch(@Param('roleId') roleId: string, @Body() body: RolePatch): Promise<Role> {
    return this.authz.patchRole(roleId, body);
  }

  @Delete('roles/:roleId')
  @HttpCode(204)
  async del(@Param('roleId') roleId: string): Promise<void> {
    await this.authz.deleteRole(roleId);
  }
}