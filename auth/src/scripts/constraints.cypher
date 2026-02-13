// Users
CREATE CONSTRAINT user_id IF NOT EXISTS
FOR (u:User) REQUIRE u.id IS UNIQUE;

CREATE CONSTRAINT user_email IF NOT EXISTS
FOR (u:User) REQUIRE u.email IS UNIQUE;

// Roles
CREATE CONSTRAINT role_id IF NOT EXISTS
FOR (r:Role) REQUIRE r.id IS UNIQUE;

CREATE CONSTRAINT role_name IF NOT EXISTS
FOR (r:Role) REQUIRE r.name IS UNIQUE;

// Permissions
CREATE CONSTRAINT permission_id IF NOT EXISTS
FOR (p:Permission) REQUIRE p.id IS UNIQUE;

// Helpful indexes
CREATE INDEX permission_method IF NOT EXISTS
FOR (p:Permission) ON (p.method);

CREATE INDEX permission_pathPattern IF NOT EXISTS
FOR (p:Permission) ON (p.pathPattern);
