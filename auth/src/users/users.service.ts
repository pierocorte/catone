import { Inject, Injectable, ConflictException, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { Driver } from "neo4j-driver";
import { NEO4J_DRIVER } from "../neo4j/neo4j.provider";
import { randomUUID } from "crypto";
import * as bcrypt from "bcrypt";
import type { components } from "../openapi";

type User = components["schemas"]["User"];
type UserCreate = components["schemas"]["UserCreate"];
type UserReplace = components["schemas"]["UserReplace"];
type UserPatch = components["schemas"]["UserPatch"];
type VerifyPasswordResponse = components["schemas"]["VerifyPasswordResponse"];

@Injectable()
export class UsersService {
  constructor(@Inject(NEO4J_DRIVER) private readonly driver: Driver) {}

  async list(): Promise<User[]> {
    const s = this.driver.session();
    try {
      const res = await s.run(
        `MATCH (u:User)
         OPTIONAL MATCH (u)-[:HAS_ROLE]->(r:Role)
         RETURN u, collect(r.name) AS roles
         ORDER BY u.createdAt DESC`,
      );
      return res.records.map((rec) => this.toUser(rec.get("u").properties, rec.get("roles")));
    } finally {
      await s.close();
    }
  }

  async create(input: UserCreate): Promise<User> {
    const s = this.driver.session();
    const id = randomUUID();
    const now = new Date().toISOString();
    const passwordHash = await bcrypt.hash(input.password, 10);

    try {
      const res = await s.run(
        `CREATE (u:User {
           id:$id, email:$email, displayName:$displayName,
           passwordHash:$passwordHash,
           createdAt:$now, updatedAt:$now
         })
         RETURN u`,
        { id, email: input.email, displayName: input.displayName, passwordHash, now },
      );
      return this.toUser(res.records[0].get("u").properties, []);
    } catch (e: any) {
      if (this.isConstraintError(e)) throw new ConflictException("User email already exists");
      throw e;
    } finally {
      await s.close();
    }
  }

  async get(id: string): Promise<User> {
    const s = this.driver.session();
    try {
      const res = await s.run(
        `MATCH (u:User {id:$id})
         OPTIONAL MATCH (u)-[:HAS_ROLE]->(r:Role)
         RETURN u, collect(r.name) AS roles`,
        { id },
      );
      if (res.records.length === 0) throw new NotFoundException("User not found");
      return this.toUser(res.records[0].get("u").properties, res.records[0].get("roles"));
    } finally {
      await s.close();
    }
  }

  async getRoles(userId: string): Promise<string[]> {
    const s = this.driver.session();
    try {
      const res = await s.run(
        `MATCH (u:User {id:$id})
         OPTIONAL MATCH (u)-[:HAS_ROLE]->(r:Role)
         RETURN u, collect(r.name) AS roles`,
        { id: userId },
      );
      if (res.records.length === 0) throw new NotFoundException("User not found");
      const roles = res.records[0].get("roles") as string[];
      return Array.isArray(roles) ? roles.filter(Boolean) : [];
    } finally {
      await s.close();
    }
  }

  async replace(id: string, input: UserReplace): Promise<User> {
    const s = this.driver.session();
    const now = new Date().toISOString();
    const passwordHash = input.password ? await bcrypt.hash(input.password, 10) : null;

    try {
      const res = await s.run(
        `MATCH (u:User {id:$id})
         SET u.email=$email, u.displayName=$displayName, u.updatedAt=$now
         FOREACH (_ IN CASE WHEN $passwordHash IS NULL THEN [] ELSE [1] END |
           SET u.passwordHash = $passwordHash
         )
         WITH u
         OPTIONAL MATCH (u)-[:HAS_ROLE]->(r:Role)
         RETURN u, collect(r.name) AS roles`,
        { id, email: input.email, displayName: input.displayName, now, passwordHash },
      );
      if (res.records.length === 0) throw new NotFoundException("User not found");
      return this.toUser(res.records[0].get("u").properties, res.records[0].get("roles"));
    } catch (e: any) {
      if (this.isConstraintError(e)) throw new ConflictException("Email already in use");
      throw e;
    } finally {
      await s.close();
    }
  }

  async patch(id: string, input: UserPatch): Promise<User> {
    const s = this.driver.session();
    const now = new Date().toISOString();
    const sets: string[] = ["u.updatedAt=$now"];
    const params: any = { id, now };

    if (input.email !== undefined) { sets.push("u.email=$email"); params.email = input.email; }
    if (input.displayName !== undefined) { sets.push("u.displayName=$displayName"); params.displayName = input.displayName; }
    if (input.password !== undefined) {
      params.passwordHash = await bcrypt.hash(input.password, 10);
      sets.push("u.passwordHash=$passwordHash");
    }

    try {
      const res = await s.run(
        `MATCH (u:User {id:$id})
         SET ${sets.join(", ")}
         WITH u
         OPTIONAL MATCH (u)-[:HAS_ROLE]->(r:Role)
         RETURN u, collect(r.name) AS roles`,
        params,
      );
      if (res.records.length === 0) throw new NotFoundException("User not found");
      return this.toUser(res.records[0].get("u").properties, res.records[0].get("roles"));
    } catch (e: any) {
      if (this.isConstraintError(e)) throw new ConflictException("Email already in use");
      throw e;
    } finally {
      await s.close();
    }
  }

  async remove(id: string): Promise<void> {
    const s = this.driver.session();
    try {
      const res = await s.run(
        `MATCH (u:User {id:$id})
         DETACH DELETE u
         RETURN 1 AS ok`,
        { id },
      );
      if (res.records.length === 0) throw new NotFoundException("User not found");
    } finally {
      await s.close();
    }
  }

  async verifyPassword(email: string, password: string): Promise<VerifyPasswordResponse> {
    const s = this.driver.session();
    try {
      const res = await s.run(
        `MATCH (u:User {email:$email})
         OPTIONAL MATCH (u)-[:HAS_ROLE]->(r:Role)
         RETURN u, collect(r.name) AS roles
         LIMIT 1`,
        { email },
      );
      if (res.records.length === 0) throw new UnauthorizedException("Invalid credentials");

      const u = res.records[0].get("u").properties;
      const roles = res.records[0].get("roles") as string[];
      const passwordHash = u.passwordHash as string | undefined;

      if (!passwordHash) throw new UnauthorizedException("Invalid credentials");

      const ok = await bcrypt.compare(password, passwordHash);
      if (!ok) throw new UnauthorizedException("Invalid credentials");

      return {
        id: u.id,
        email: u.email,
        displayName: u.displayName,
        roles: Array.isArray(roles) ? roles.filter(Boolean) : [],
      };
    } finally {
      await s.close();
    }
  }

  private toUser(p: any, roles: string[]): User {
    return {
      id: p.id,
      email: p.email,
      displayName: p.displayName,
      roles: Array.isArray(roles) ? roles.filter(Boolean) : [],
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    };
  }

  private isConstraintError(e: any) {
    return typeof e?.code === "string" && e.code.includes("ConstraintValidationFailed");
  }
}
