import { Controller, Delete, Get, HttpCode, Param, Put } from '@nestjs/common';
import { AuthzService } from './authz.service';
import type { components } from '../openapi';

type Permission = components['schemas']['Permission'];
type Role = components['schemas']['Role'];

@Controller()
export class BindingsController {
  constructor(private readonly authz: AuthzService) {}

  // ---- role -> permissions ----
  @Get('roles/:roleId/permissions')
  listRolePermissions(@Param('roleId') roleId: string): Promise<Permission[]> {
    return this.authz.listRolePermissions(roleId);
  }

  @Put('roles/:roleId/permissions/:permissionId')
  @HttpCode(204)
  async grantPermissionToRole(
    @Param('roleId') roleId: string,
    @Param('permissionId') permissionId: string,
  ): Promise<void> {
    await this.authz.grantPermissionToRole(roleId, permissionId);
  }

  @Delete('roles/:roleId/permissions/:permissionId')
  @HttpCode(204)
  async revokePermissionFromRole(
    @Param('roleId') roleId: string,
    @Param('permissionId') permissionId: string,
  ): Promise<void> {
    await this.authz.revokePermissionFromRole(roleId, permissionId);
  }

  // ---- user -> roles ----
  @Get('users/:userId/roles')
  listUserRoles(@Param('userId') userId: string): Promise<Role[]> {
    return this.authz.listUserRoles(userId);
  }

  @Put('users/:userId/roles/:roleId')
  @HttpCode(204)
  async assignRoleToUser(@Param('userId') userId: string, @Param('roleId') roleId: string): Promise<void> {
    await this.authz.assignRoleToUser(userId, roleId);
  }

  @Delete('users/:userId/roles/:roleId')
  @HttpCode(204)
  async unassignRoleFromUser(@Param('userId') userId: string, @Param('roleId') roleId: string): Promise<void> {
    await this.authz.unassignRoleFromUser(userId, roleId);
  }
}