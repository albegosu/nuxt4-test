# Environment Configuration

## Purpose

Set up environment variables for secure configuration management. This includes database URLs, authentication secrets, and other sensitive or environment-specific settings.

## Dependencies

- Nuxt 4 project initialized
- Basic understanding of environment variables

## Step-by-Step Setup

### Step 1: Create Environment Files

Create the environment template and actual environment file:

```bash
touch .env.example
touch .env
```

### Step 2: Define Environment Variables

Add the following variables to `.env.example` (template):

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/nuxt4_test?schema=public"

# Better Auth
BETTER_AUTH_SECRET="your-secret-key-here-change-in-production"
BETTER_AUTH_URL="http://localhost:3000"

# Application
NODE_ENV="development"
```

### Step 3: Copy to .env

Copy the example file and fill in actual values:

```bash
cp .env.example .env
```

**Important**: Edit `.env` with your actual values. Never commit `.env` to version control.

### Step 4: Update .gitignore

Ensure `.env` is in `.gitignore`:

```gitignore
# Environment variables
.env
.env.local
.env.*.local

# Dependencies
node_modules/

# Build output
.nuxt
.output
dist
```

### Step 5: Configure Runtime Config

Update `nuxt.config.ts` to use environment variables:

```typescript
export default defineNuxtConfig({
  runtimeConfig: {
    // Private: only available on server-side
    betterAuthSecret: process.env.BETTER_AUTH_SECRET,
    databaseUrl: process.env.DATABASE_URL,
    
    // Public: exposed to client-side
    public: {
      betterAuthUrl: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
    }
  }
})
```

## Configuration

### Environment Variables Reference

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Yes | `postgresql://user:pass@localhost:5432/db` |
| `BETTER_AUTH_SECRET` | Secret key for auth encryption | Yes | Random 32+ character string |
| `BETTER_AUTH_URL` | Base URL for auth callbacks | Yes | `http://localhost:3000` |
| `NODE_ENV` | Environment mode | No | `development`, `production` |

### Generating Secrets

Generate a secure secret for Better Auth:

```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Using OpenSSL
openssl rand -hex 32
```

## Accessing Environment Variables

### Server-Side

Access private config in server code:

```typescript
// In server/api/ or server/middleware/
const config = useRuntimeConfig()
const dbUrl = config.databaseUrl // ✅ Available
```

### Client-Side

Access public config in components:

```typescript
// In components or pages
const config = useRuntimeConfig()
const authUrl = config.public.betterAuthUrl // ✅ Available
const dbUrl = config.databaseUrl // ❌ Undefined (private)
```

## Key Files

- `.env` - Actual environment variables (not committed)
- `.env.example` - Template for environment variables (committed)
- `nuxt.config.ts` - Runtime config mapping
- `.gitignore` - Ensures `.env` is not committed

## Notes & Gotchas

- **Never Commit .env**: Always add `.env` to `.gitignore`. Use `.env.example` as a template
- **Secret Generation**: Generate strong secrets for production. Never use default/weak secrets
- **Environment Separation**: Use different `.env` files for development, staging, and production
- **Public vs Private**: Only variables in `runtimeConfig.public` are accessible client-side
- **Type Safety**: Runtime config is typed based on `nuxt.config.ts` definition

## Production Considerations

- Use environment variables provided by hosting platform (Vercel, Netlify, etc.)
- Never hardcode secrets in code
- Rotate secrets periodically
- Use different secrets for each environment
- Consider using secret management services for production

## Next Steps

- [Prisma Setup](../02-database/prisma-setup.md) - Configure database connection
- [Better Auth Setup](../03-authentication/better-auth-setup.md) - Configure authentication
