# Infrastructure Setup

## Purpose

This guide covers the initial setup of the Nuxt 4 project, including installation, basic configuration, and project initialization. This is the foundation for all subsequent development.

## Dependencies

- Node.js 18+ (LTS recommended)
- npm or pnpm
- Git

## Step-by-Step Setup

### Step 1: Initialize Nuxt 4 Project

Create a new Nuxt 4 project using the Nuxt CLI:

```bash
npx nuxi@latest init nuxt4-test
cd nuxt4-test
```

Alternatively, if already in the project directory:

```bash
npx nuxi@latest init .
```

### Step 2: Install Dependencies

Install project dependencies:

```bash
npm install
# or
pnpm install
```

### Step 3: Verify Installation

Start the development server to verify everything works:

```bash
npm run dev
```

You should see the Nuxt application running at `http://localhost:3000`

### Step 4: Verify Project Structure

Confirm the following directories exist:
- `server/` - Server-side code
- `components/` - Vue components
- `pages/` - File-based routing
- `public/` - Static assets

## Configuration

### Key Configuration Files

- `nuxt.config.ts` - Main Nuxt configuration file
- `package.json` - Project dependencies and scripts
- `.gitignore` - Git ignore patterns (should include `.env`, `node_modules`, etc.)

### Initial nuxt.config.ts

The default Nuxt 4 configuration should look similar to:

```typescript
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
```

## Key Files

- `nuxt.config.ts` - Nuxt configuration
- `package.json` - Dependencies and scripts
- `.gitignore` - Files to ignore in version control
- `app.vue` - Root Vue component (or can be removed if using layouts/pages)

## Notes & Gotchas

- **Node.js Version**: Ensure you're using Node.js 18+ as Nuxt 4 requires modern Node.js features
- **Package Manager**: Choose either npm or pnpm and be consistent throughout the project
- **Development Server**: The default port is 3000, but can be changed if needed
- **TypeScript**: Nuxt 4 has TypeScript support built-in, no additional setup needed initially

## Next Steps

- [Project Structure](project-structure.md) - Organize full-stack directory structure
- [Environment Configuration](environment.md) - Set up environment variables
