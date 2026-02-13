import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Put } from "@nestjs/common";
import { UsersService } from "./users.service";
import type { components } from "../openapi";

type User = components["schemas"]["User"];
type UserCreate = components["schemas"]["UserCreate"];
type UserReplace = components["schemas"]["UserReplace"];
type UserPatch = components["schemas"]["UserPatch"];
type VerifyPasswordRequest = components["schemas"]["VerifyPasswordRequest"];
type VerifyPasswordResponse = components["schemas"]["VerifyPasswordResponse"];

@Controller()
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get("users")
  list(): Promise<User[]> {
    return this.users.list();
  }

  @Post("users")
  create(@Body() body: UserCreate): Promise<User> {
    // default Nest POST = 201, OpenAPI expects 201
    return this.users.create(body);
  }

  @Get("users/:id")
  get(@Param("id") id: string): Promise<User> {
    return this.users.get(id);
  }

  @Put("users/:id")
  replace(@Param("id") id: string, @Body() body: UserReplace): Promise<User> {
    return this.users.replace(id, body);
  }

  @Patch("users/:id")
  patch(@Param("id") id: string, @Body() body: UserPatch): Promise<User> {
    return this.users.patch(id, body);
  }

  @Delete("users/:id")
  @HttpCode(204)
  async del(@Param("id") id: string): Promise<void> {
    await this.users.remove(id);
  }

  @Post("users/verify-password")
  @HttpCode(200)
  verifyPassword(@Body() body: VerifyPasswordRequest): Promise<VerifyPasswordResponse> {
    return this.users.verifyPassword(body.email, body.password);
  }
}
