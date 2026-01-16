# Better Auth Setup

## Purpose

Install and configure Better Auth for authentication in the Nuxt 4 application. Better Auth provides secure, flexible authentication with multiple recipe options including email/password and magic links.

## Dependencies

- Nuxt 4 project initialized
- Environment variables configured
- Database setup with Prisma (see [Prisma Setup](../02-database/prisma-setup.md))
- Understanding of authentication flows

## Step-by-Step Setup

### Step 1: Install Better Auth

Install Better Auth and Prisma adapter:

```bash
npm install better-auth
npm install @better-auth/prisma
```

### Step 2: Create Auth Configuration

Create `server/utils/auth.ts`:

```typescript
import { betterAuth } from "better-auth"
import { prismaAdapter } from "@better-auth/prisma/adapter"
import prisma from "./prisma"

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql"
  }),
  emailAndPassword: {
    enabled: true,
  },
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  basePath: "/api/auth",
})
```

### Step 3: Create Auth API Route

Create `server/api/auth/[...].ts`:

```typescript
import { auth } from "~/server/utils/auth"
import { toNodeHandler } from "better-auth/node"

export default toNodeHandler(auth)
```

This creates all auth endpoints under `/api/auth/*`.

### Step 4: Create Auth Composable

Create `composables/useAuth.ts`:

```typescript
import { useRuntimeConfig } from "#app"

export const useAuth = () => {
  const config = useRuntimeConfig()
  const authUrl = config.public.betterAuthUrl

  const signIn = async (email: string, password: string) => {
    const response = await fetch(`${authUrl}/api/auth/sign-in/email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    })
    return response.json()
  }

  const signUp = async (email: string, password: string, name?: string) => {
    const response = await fetch(`${authUrl}/api/auth/sign-up/email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password, name }),
    })
    return response.json()
  }

  const signOut = async () => {
    const response = await fetch(`${authUrl}/api/auth/sign-out`, {
      method: "POST",
      credentials: "include",
    })
    return response.json()
  }

  const getSession = async () => {
    const response = await fetch(`${authUrl}/api/auth/get-session`, {
      credentials: "include",
    })
    return response.json()
  }

  return {
    signIn,
    signUp,
    signOut,
    getSession,
  }
}
```

### Step 5: Configure Environment Variables

Ensure these are in `.env`:

```env
BETTER_AUTH_SECRET="your-secret-key-here" # Generate with: openssl rand -hex 32
BETTER_AUTH_URL="http://localhost:3000"
```

### Step 6: Update Prisma Schema

Add Better Auth tables to your schema. Better Auth requires specific models. Update `prisma/schema.prisma`:

```prisma
// Add these models for Better Auth
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  emailVerified Boolean   @default(false)
  name          String?
  image         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  accounts      Account[]
  sessions      Session[]
  
  @@map("users")
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refreshToken      String?
  accessToken       String?
  expiresAt         DateTime?
  tokenType         String?
  scope             String?
  idToken           String?
  sessionState      String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([provider, providerAccountId])
  @@map("accounts")
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@map("sessions")
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime
  
  @@unique([identifier, token])
  @@map("verification_tokens")
}
```

**Note**: You may need to merge these with your existing User model. Adjust accordingly.

Run migration:

```bash
npx prisma migrate dev --name add_better_auth
npx prisma generate
```

## Configuration

### Auth Options

Key configuration options in `betterAuth()`:

- `database`: Prisma adapter configuration
- `emailAndPassword.enabled`: Enable email/password auth
- `secret`: Secret key for encryption
- `baseURL`: Application base URL
- `basePath`: Auth endpoints path (default: `/api/auth`)

### Auth Endpoints

Better Auth creates these endpoints automatically:
- `POST /api/auth/sign-up/email` - User registration
- `POST /api/auth/sign-in/email` - User login
- `POST /api/auth/sign-out` - User logout
- `GET /api/auth/get-session` - Get current session

## Key Files

- `server/utils/auth.ts` - Auth configuration
- `server/api/auth/[...].ts` - Auth API handler
- `composables/useAuth.ts` - Client-side auth composable
- `prisma/schema.prisma` - Auth database models

## Notes & Gotchas

- **Secret Key**: Generate a strong secret key (32+ characters)
- **Session Storage**: Better Auth uses cookies for session management by default
- **CORS**: Ensure CORS is configured if using separate frontend/backend
- **Database Models**: Better Auth requires specific database models - merge carefully with existing User model
- **TypeScript**: Better Auth has excellent TypeScript support

## Next Steps

- [Email/Password Auth](email-password-auth.md) - Configure email/password recipe
- [Session Management](session-management.md) - Configure session handling
- [Protected Routes](protected-routes.md) - Set up route protection
