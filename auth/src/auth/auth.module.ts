// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { AuthzModule } from '../authz/authz.module';

@Module({
  imports: [UsersModule, AuthzModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
