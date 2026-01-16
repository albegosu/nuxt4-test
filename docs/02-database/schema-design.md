# Schema Design

## Purpose

Design the multi-tenant database schema using Prisma. This includes Tenant (Empresa), Centro, and User models with proper relationships and multi-tenancy patterns.

## Dependencies

- Prisma installed and initialized (see [Prisma Setup](prisma-setup.md))
- Understanding of multi-tenant architecture

## Step-by-Step Setup

### Step 1: Define Tenant Model

The Tenant model represents a company/empresa with CIF as unique identifier:

```prisma
model Tenant {
  id        String   @id @default(cuid())
  cif       String   @unique
  name      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  centros   Centro[]
  users     User[]
  
  @@map("tenants")
}
```

### Step 2: Define Centro Model

Centro model represents locations/centers that belong to a tenant (1:N relationship):

```prisma
model Centro {
  id        String   @id @default(cuid())
  name      String
  tenantId  String
  tenant    Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@map("centros")
}
```

### Step 3: Define User Model

User model linked to Tenant for multi-tenant user management:

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  tenantId  String
  tenant    Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@map("users")
}
```

### Step 4: Complete Schema

Your complete `prisma/schema.prisma` should look like:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Tenant {
  id        String   @id @default(cuid())
  cif       String   @unique
  name      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  centros   Centro[]
  users     User[]
  
  @@map("tenants")
}

model Centro {
  id        String   @id @default(cuid())
  name      String
  tenantId  String
  tenant    Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@map("centros")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  tenantId  String
  tenant    Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@map("users")
}
```

## Multi-Tenancy Strategy

### Shared Schema Pattern

This implementation uses a **shared schema** pattern:
- All tenants share the same database tables
- Data isolation via `tenantId` foreign keys
- Efficient querying and maintenance
- Easier to scale initially

### Data Isolation

Ensure all queries filter by `tenantId`:

```typescript
// ✅ Good: Filtered by tenant
const centros = await prisma.centro.findMany({
  where: { tenantId: currentTenantId }
})

// ❌ Bad: Missing tenant filter
const centros = await prisma.centro.findMany() // Returns all centros!
```

### Optional: Row-Level Security (RLS)

For additional security, consider PostgreSQL Row-Level Security:

```sql
-- Enable RLS on tables
ALTER TABLE centros ENABLE ROW LEVEL SECURITY;

-- Create policy (example)
CREATE POLICY tenant_isolation ON centros
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);
```

## Key Relationships

- **Tenant → Centro**: One-to-Many (1:N)
  - One tenant has many centros
  - Centro belongs to one tenant
  
- **Tenant → User**: One-to-Many (1:N)
  - One tenant has many users
  - User belongs to one tenant

## Configuration

### Cascade Deletion

The schema uses `onDelete: Cascade`:
- Deleting a Tenant deletes all related Centros and Users
- Be careful with this in production - consider soft deletes

### Indexes

Consider adding indexes for performance:

```prisma
model Centro {
  // ... fields
  tenantId  String
  
  @@index([tenantId]) // Index for tenant filtering
  @@map("centros")
}
```

## Key Files

- `prisma/schema.prisma` - Complete schema definition
- Database tables: `tenants`, `centros`, `users`

## Notes & Gotchas

- **CIF Uniqueness**: CIF must be unique across all tenants (business requirement)
- **Email Uniqueness**: Email is globally unique, not per-tenant (adjust if needed)
- **Cascade Deletes**: Deleting a tenant removes all related data - consider soft deletes
- **Query Filtering**: Always filter by `tenantId` in queries to prevent data leaks
- **Migrations**: Run `npx prisma migrate dev` after schema changes

## Alternative Approaches

### Per-Tenant Email (if needed)

If emails should be unique per tenant:

```prisma
model User {
  email    String
  tenantId String
  
  @@unique([email, tenantId]) // Unique per tenant
}
```

### Soft Deletes (optional)

Add soft delete support:

```prisma
model Tenant {
  deletedAt DateTime?
  // ... other fields
}
```

## Next Steps

- [Migrations & Seeding](migrations-seeding.md) - Create initial migration and seed data
- [Better Auth Setup](../03-authentication/better-auth-setup.md) - Integrate with authentication
