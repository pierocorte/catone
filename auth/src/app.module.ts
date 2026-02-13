import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Neo4jModule } from './neo4j/neo4j.module';
import { UsersModule } from './users/users.module';
import { AuthzModule } from './authz/authz.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    Neo4jModule,
    UsersModule,
    AuthzModule,
    AuthModule,
  ],
})
export class AppModule { }
