// Load environment variables FIRST, before any other imports
import { config } from 'dotenv'
config()

import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

// Verify DATABASE_URL is loaded
if (!process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_URL is not set!')
  process.exit(1)
}

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

// Create Prisma adapter
const adapter = new PrismaPg(pool)

// Create PrismaClient with adapter
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Seeding database...')

  // Clear existing seed data (optional - comment out if you want to keep existing data)
  console.log('Clearing existing seed data...')
  await prisma.user.deleteMany({
    where: {
      email: {
        in: ['admin@empresa1.com', 'admin@empresa2.com', 'user1@empresa1.com'],
      },
    },
  })
  await prisma.tenant.deleteMany({
    where: {
      cif: {
        in: ['B12345678', 'B87654321'],
      },
    },
  })

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
