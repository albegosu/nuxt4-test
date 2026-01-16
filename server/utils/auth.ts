import { betterAuth } from "better-auth"

// Load environment variables
const databaseUrl = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/nuxt4_test?schema=public"
const authSecret = process.env.BETTER_AUTH_SECRET || "dev-secret"
const authUrl = process.env.BETTER_AUTH_URL || "http://localhost:3000"

// Better Auth configuration
// Using direct PostgreSQL connection - Better Auth will manage its own connection pool
// This avoids conflicts with Prisma 7's adapter pattern
// Better Auth will use the same database but with its own connection
let authInstance: ReturnType<typeof betterAuth> | null = null

const initAuth = () => {
  if (authInstance) return authInstance
  
  try {
    // Use direct database connection string - Better Auth supports this for PostgreSQL
    // This is the recommended approach when using Prisma 7 with adapters
    console.log('🔧 Initializing Better Auth with database URL:', databaseUrl.replace(/:[^:@]+@/, ':****@'))
    
    authInstance = betterAuth({
      database: {
        provider: "postgresql",
        url: databaseUrl,
      },
      emailAndPassword: {
        enabled: true,
      },
      secret: authSecret,
      baseURL: authUrl,
      basePath: "/api/auth",
    })
    
    console.log('✅ Better Auth initialized successfully')
    return authInstance
  } catch (error) {
    console.error('❌ Better Auth initialization failed:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      cause: error instanceof Error ? error.cause : undefined,
    })
    throw error
  }
}

// Lazy initialization - only create when first accessed
// This prevents errors during module import if database isn't ready
export const auth = new Proxy({} as ReturnType<typeof betterAuth>, {
  get(target, prop) {
    try {
      const instance = initAuth()
      const value = (instance as any)[prop]
      if (typeof value === 'function') {
        return value.bind(instance)
      }
      return value
    } catch (error) {
      // If initialization fails, return a no-op handler for this property
      console.error('Better Auth initialization error:', error)
      if (prop === 'handler') {
        return () => {
          throw new Error('Better Auth is not initialized. Check database connection.')
        }
      }
      throw error
    }
  }
})
