import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query } from '@nestjs/common';
import { AuthzService } from './authz.service';
import type { components } from '../openapi';

type Permission = components['schemas']['Permission'];
type PermissionCreate = components['schemas']['PermissionCreate'];
type PermissionPatch = components['schemas']['PermissionPatch'];

@Controller()
export class PermissionsController {
  constructor(private readonly authz: AuthzService) {}

  @Get('permissions')
  list(@Query('method') method?: string): Promise<Permission[]> {
    return this.authz.listPermissions(method);
  }

  @Post('permissions')
  create(@Body() body: PermissionCreate): Promise<Permission> {
    return this.authz.createPermission(body);
  }

  @Get('permissions/:permissionId')
  get(@Param('permissionId') permissionId: string): Promise<Permission> {
    return this.authz.getPermission(permissionId);
  }

  @Patch('permissions/:permissionId')
  patch(@Param('permissionId') permissionId: string, @Body() body: PermissionPatch): Promise<Permission> {
    return this.authz.patchPermission(permissionId, body);
  }

  @Delete('permissions/:permissionId')
  @HttpCode(204)
  async del(@Param('permissionId') permissionId: string): Promise<void> {
    await this.authz.deletePermission(permissionId);
  }
}