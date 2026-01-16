# Prisma Setup

## Purpose

Install and configure Prisma ORM for database management with PostgreSQL. This includes Prisma initialization, client generation, and basic configuration.

## Dependencies

- Node.js 18+
- PostgreSQL 14+ (local or via Docker)
- Nuxt 4 project initialized
- Environment variables configured (see [Environment Configuration](../01-setup/environment.md))

## Step-by-Step Setup

### Step 1: Install Prisma

Install Prisma CLI and Client:

```bash
npm install -D prisma
npm install @prisma/client
```

### Step 2: Initialize Prisma

Initialize Prisma in your project:

```bash
npx prisma init
```

This creates:
- `prisma/` directory
- `prisma/schema.prisma` - Database schema definition
- `.env` entry for `DATABASE_URL` (if not exists)

### Step 3: Configure Database URL

Ensure `DATABASE_URL` is set in `.env`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/nuxt4_test?schema=public"
```

For Docker PostgreSQL:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/nuxt4_test?schema=public"
```

### Step 4: Generate Prisma Client

Generate the Prisma Client after schema changes:

```bash
npx prisma generate
```

This creates TypeScript types based on your schema.

### Step 5: Create Prisma Service

Create a Prisma client singleton for Nuxt:

Create `server/utils/prisma.ts`:

```typescript
import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  return new PrismaClient()
}

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma

export default prisma
```

## Configuration

### schema.prisma Structure

The `prisma/schema.prisma` file should have this basic structure:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Models will be defined here (see schema-design.md)
```

### Using Prisma in Nuxt

In server routes:

```typescript
// server/api/users/index.ts
import prisma from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const users = await prisma.user.findMany()
  return users
})
```

## Key Files

- `prisma/schema.prisma` - Database schema definition
- `server/utils/prisma.ts` - Prisma client singleton
- `.env` - Database connection string

## Notes & Gotchas

- **Client Generation**: Run `npx prisma generate` after every schema change
- **Development**: The Prisma client singleton prevents multiple instances in development
- **Migrations**: Use `npx prisma migrate dev` to create and apply migrations
- **Studio**: Use `npx prisma studio` to visually manage your database
- **Connection Pooling**: Consider connection pooling for production (e.g., PgBouncer)

## Useful Commands

```bash
# Generate Prisma Client
npx prisma generate

# Create and apply migration
npx prisma migrate dev --name migration_name

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Open Prisma Studio (database GUI)
npx prisma studio

# Format schema file
npx prisma format

# Validate schema
npx prisma validate
```

## Next Steps

- [Schema Design](schema-design.md) - Design multi-tenant database models
- [Migrations & Seeding](migrations-seeding.md) - Set up migrations and seed data
