// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  
  // Runtime config for environment variables
  runtimeConfig: {
    // Private keys (server-side only)
    betterAuthSecret: process.env.BETTER_AUTH_SECRET,
    databaseUrl: process.env.DATABASE_URL,
    
    // Public keys (exposed to client)
    public: {
      betterAuthUrl: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
    }
  }
})
