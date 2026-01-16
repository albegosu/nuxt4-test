# Migrations & Seeding

## Purpose

Create database migrations from the Prisma schema and set up seed data for development and testing. This includes initial migrations and dummy data for tenants, centros, and users.

## Dependencies

- Prisma schema defined (see [Schema Design](schema-design.md))
- Database connection configured
- PostgreSQL database accessible

## Step-by-Step Setup

### Step 1: Create Initial Migration

Generate and apply the initial migration:

```bash
npx prisma migrate dev --name init
```

This will:
- Create migration files in `prisma/migrations/`
- Apply the migration to your database
- Generate Prisma Client

### Step 2: Create Seed Script

Create `prisma/seed.ts`:

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create Tenant 1
  const tenant1 = await prisma.tenant.create({
    data: {
      cif: 'B12345678',
      name: 'Empresa Demo 1',
      centros: {
        create: [
          { name: 'Centro Madrid' },
          { name: 'Centro Barcelona' },
        ],
      },
      users: {
        create: [
          {
            email: 'admin@empresa1.com',
            name: 'Admin Empresa 1',
          },
        ],
      },
    },
  })

  // Create Tenant 2
  const tenant2 = await prisma.tenant.create({
    data: {
      cif: 'B87654321',
      name: 'Empresa Demo 2',
      centros: {
        create: [
          { name: 'Centro Valencia' },
        ],
      },
      users: {
        create: [
          {
            email: 'admin@empresa2.com',
            name: 'Admin Empresa 2',
          },
        ],
      },
    },
  })

  // Create additional centros for tenant1
  await prisma.centro.create({
    data: {
      name: 'Centro Sevilla',
      tenantId: tenant1.id,
    },
  })

  // Create additional users
  await prisma.user.create({
    data: {
      email: 'user1@empresa1.com',
      name: 'Usuario 1',
      tenantId: tenant1.id,
    },
  })

  console.log('Seeding completed!')
  console.log(`Created tenant: ${tenant1.name} (${tenant1.cif})`)
  console.log(`Created tenant: ${tenant2.name} (${tenant2.cif})`)
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

### Step 3: Configure Seed Script

Update `package.json` to include seed configuration:

```json
{
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  },
  "scripts": {
    "db:seed": "prisma db seed",
    "db:migrate": "prisma migrate dev",
    "db:studio": "prisma studio"
  }
}
```

Install tsx for running TypeScript seed:

```bash
npm install -D tsx
```

### Step 4: Run Seed

Execute the seed script:

```bash
npm run db:seed
# or
npx prisma db seed
```

## Migration Workflow

### Creating New Migrations

After changing the schema:

```bash
# 1. Edit prisma/schema.prisma

# 2. Create and apply migration
npx prisma migrate dev --name add_new_field

# 3. Prisma Client is auto-generated
```

### Resetting Database (Development Only)

**Warning**: This deletes all data!

```bash
npx prisma migrate reset
```

This will:
- Drop database
- Recreate database
- Apply all migrations
- Run seed script (if configured)

### Viewing Migrations

Migrations are stored in `prisma/migrations/`:

```
prisma/migrations/
└── 20240101000000_init/
    └── migration.sql
```

## Configuration

### Seed Data Structure

The seed creates:
- **2 Tenants**: Demo companies with different CIFs
- **Multiple Centros**: Different locations per tenant
- **Multiple Users**: Admin and regular users per tenant

### Customizing Seed Data

Modify `prisma/seed.ts` to:
- Add more tenants
- Create realistic test data
- Link data for specific test scenarios
- Create edge cases for testing

## Key Files

- `prisma/migrations/` - Migration history
- `prisma/seed.ts` - Seed script
- `package.json` - Seed configuration and scripts

## Notes & Gotchas

- **Migration Names**: Use descriptive names for migrations
- **Seed in Production**: Never run seed in production without careful consideration
- **Data Relationships**: Use nested creates for related data (cleaner)
- **TypeScript**: Use `tsx` or compile TypeScript seed files
- **Reset Warning**: `prisma migrate reset` deletes all data - use with caution

## Useful Commands

```bash
# Create and apply migration
npx prisma migrate dev --name migration_name

# Apply pending migrations (production)
npx prisma migrate deploy

# Reset database and reseed
npx prisma migrate reset

# Run seed
npm run db:seed

# View database in Prisma Studio
npx prisma studio

# Generate Prisma Client only
npx prisma generate
```

## Testing Migrations

### Verify Migration

After migration, verify schema matches:

```bash
npx prisma db pull
# Compare with schema.prisma
```

### Check Migration Status

```bash
npx prisma migrate status
```

## Production Considerations

- **Migration Strategy**: Use `prisma migrate deploy` in production (no prompt)
- **Backup**: Always backup database before migrations
- **Rollback**: Plan for rollback strategies (Prisma doesn't support automatic rollbacks)
- **Seed**: Don't run seed scripts in production
- **Migration Review**: Review generated SQL in migration files before applying

## Next Steps

- [Better Auth Setup](../03-authentication/better-auth-setup.md) - Integrate authentication
- [Initial Tests](../07-testing/initial-tests.md) - Test database connection and queries
