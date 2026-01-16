# Session Management

## Purpose

Configure session management in Better Auth, choosing between secure cookies and JWT tokens, and understanding session lifecycle management.

## Dependencies

- Better Auth installed and configured (see [Better Auth Setup](better-auth-setup.md))
- Database models set up (Session model in Prisma schema)

## Step-by-Step Setup

### Step 1: Understand Session Storage

Better Auth supports two session storage methods:

**Option A: Secure Cookies (Default & Recommended)**
- Stored as HTTP-only cookies
- Automatic CSRF protection
- Secure by default
- Works seamlessly with SSR

**Option B: JWT Tokens**
- Stateless tokens
- Stored in localStorage or cookies
- Requires manual token refresh
- Better for mobile/SPA scenarios

### Step 2: Configure Cookie-Based Sessions (Default)

Cookies are the default. Verify configuration:

```typescript
// server/utils/auth.ts
export const auth = betterAuth({
  // ... other config
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days in seconds
    updateAge: 60 * 60 * 24, // Update session age daily
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // Cache for 5 minutes
    },
  },
})
```

### Step 3: Configure JWT Sessions (Optional)

If you need JWT tokens instead:

```typescript
export const auth = betterAuth({
  // ... other config
  session: {
    strategy: "jwt",
    expiresIn: 60 * 60 * 24 * 7, // 7 days
  },
})
```

For JWT, you'll need to manually handle token storage and refresh in your composable.

### Step 4: Create Session Composable

Enhance `composables/useAuth.ts` with session management:

```typescript
export const useAuth = () => {
  const config = useRuntimeConfig()
  const authUrl = config.public.betterAuthUrl
  
  const user = ref(null)
  const session = ref(null)
  const loading = ref(true)

  // Get current session
  const fetchSession = async () => {
    try {
      const response = await fetch(`${authUrl}/api/auth/get-session`, {
        credentials: "include",
      })
      const data = await response.json()
      session.value = data.session
      user.value = data.user
      return data
    } catch (error) {
      console.error("Session fetch error:", error)
      return null
    } finally {
      loading.value = false
    }
  }

  // Check if user is authenticated
  const isAuthenticated = computed(() => {
    return !!session.value && !!user.value
  })

  // Refresh session
  const refreshSession = async () => {
    return await fetchSession()
  }

  // Initialize session on mount
  if (process.client) {
    fetchSession()
  }

  return {
    user: readonly(user),
    session: readonly(session),
    loading: readonly(loading),
    isAuthenticated,
    fetchSession,
    refreshSession,
    // ... other auth methods
  }
}
```

### Step 5: Create Session Middleware

Create `middleware/session.ts` to refresh session on route changes:

```typescript
export default defineNuxtRouteMiddleware(async (to, from) => {
  const { fetchSession } = useAuth()
  
  // Refresh session on navigation
  await fetchSession()
})
```

Apply to specific routes or globally in `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  // ... other config
  router: {
    middleware: ['session'] // Apply to all routes
  }
})
```

### Step 6: Handle Session Expiration

Create a plugin to handle expired sessions:

```typescript
// plugins/session-handler.ts
export default defineNuxtPlugin(async () => {
  const { fetchSession, signOut } = useAuth()

  // Check session periodically
  if (process.client) {
    setInterval(async () => {
      const sessionData = await fetchSession()
      
      if (!sessionData?.session) {
        // Session expired, redirect to login
        await signOut()
        await navigateTo('/auth/signin')
      }
    }, 5 * 60 * 1000) // Check every 5 minutes
  }
})
```

## Configuration

### Session Options

```typescript
session: {
  // Session duration in seconds
  expiresIn: 60 * 60 * 24 * 7, // 7 days
  
  // How often to update session timestamp
  updateAge: 60 * 60 * 24, // 1 day
  
  // Cookie-specific options
  cookieCache: {
    enabled: true,
    maxAge: 60 * 5, // 5 minutes
  },
  
  // Cookie settings
  cookie: {
    sameSite: 'lax', // 'strict', 'lax', or 'none'
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    httpOnly: true, // Prevent JavaScript access
    path: '/',
  },
}
```

### Cookie Security

For production, ensure secure cookies:

```typescript
session: {
  cookie: {
    secure: true, // HTTPS only
    sameSite: 'lax',
    httpOnly: true,
    domain: '.yourdomain.com', // If using subdomains
  },
}
```

## Accessing Session in Server Routes

In server-side code:

```typescript
// server/api/protected.ts
import { auth } from "~/server/utils/auth"

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({ headers: event.node.req.headers })
  
  if (!session) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized',
    })
  }
  
  // Use session.user to access user data
  return { user: session.user }
})
```

## Key Files

- `server/utils/auth.ts` - Session configuration
- `composables/useAuth.ts` - Session management composable
- `middleware/session.ts` - Session refresh middleware
- `plugins/session-handler.ts` - Session expiration handler

## Notes & Gotchas

- **Cookie vs JWT**: Cookies are recommended for web apps, JWT for mobile/SPA
- **CSRF Protection**: Cookies automatically include CSRF protection
- **Session Refresh**: Sessions are automatically refreshed on activity
- **Expiration**: Expired sessions require re-authentication
- **Security**: Always use secure cookies in production (HTTPS required)

## Session Lifecycle

1. **Login**: Session created in database and cookie set
2. **Active Use**: Session timestamp updated on activity
3. **Expiration Check**: Middleware/plugin checks session validity
4. **Refresh**: Session refreshed if still valid
5. **Logout**: Session deleted from database and cookie cleared

## Testing Sessions

Test session management:

```typescript
// Test session creation
const { signIn } = useAuth()
await signIn('test@example.com', 'password')

// Test session retrieval
const { session, user } = useAuth()
console.log('Session:', session.value)
console.log('User:', user.value)

// Test session expiration
// Wait for expiration time, then check session
```

## Next Steps

- [Protected Routes](protected-routes.md) - Use sessions for route protection
- [Forced Onboarding](../04-onboarding/forced-onboarding.md) - Check session for onboarding status
