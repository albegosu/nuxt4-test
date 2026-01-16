# Protected Routes

## Purpose

Implement route protection using Nuxt middleware to restrict access to authenticated routes and handle authentication redirects.

## Dependencies

- Better Auth configured (see [Better Auth Setup](better-auth-setup.md))
- Session management set up (see [Session Management](session-management.md))
- Auth composable created

## Step-by-Step Setup

### Step 1: Create Authentication Middleware

Create `middleware/auth.ts`:

```typescript
export default defineNuxtRouteMiddleware(async (to, from) => {
  const { isAuthenticated, loading, fetchSession } = useAuth()
  
  // Wait for session to load
  if (loading.value) {
    await fetchSession()
  }
  
  // Check if user is authenticated
  if (!isAuthenticated.value) {
    // Redirect to sign in with return URL
    return navigateTo({
      path: '/auth/signin',
      query: {
        redirect: to.fullPath,
      },
    })
  }
})
```

### Step 2: Apply Middleware to Protected Routes

**Option A: Page-level middleware**

Add to individual pages:

```vue
<!-- pages/dashboard.vue -->
<script setup>
definePageMeta({
  middleware: 'auth',
})
</script>

<template>
  <div>Protected Dashboard</div>
</template>
```

**Option B: Layout-level middleware**

Apply to all pages using a layout:

```vue
<!-- layouts/authenticated.vue -->
<script setup>
definePageMeta({
  middleware: 'auth',
})
</script>

<template>
  <div>
    <header>Authenticated Layout</header>
    <slot />
  </div>
</template>
```

Use the layout:

```vue
<!-- pages/dashboard.vue -->
<script setup>
definePageMeta({
  layout: 'authenticated',
})
</script>
```

### Step 3: Handle Redirect After Login

Update sign-in page to handle redirect query parameter:

```vue
<!-- pages/auth/signin.vue -->
<script setup>
const route = useRoute()

const handleSignIn = async () => {
  // ... sign in logic
  
  // Redirect to original destination or dashboard
  const redirect = route.query.redirect as string || '/dashboard'
  await navigateTo(redirect)
}
</script>
```

### Step 4: Create Guest-Only Middleware (Optional)

Create middleware for routes that should only be accessible when NOT authenticated:

```typescript
// middleware/guest.ts
export default defineNuxtRouteMiddleware(async (to, from) => {
  const { isAuthenticated, fetchSession } = useAuth()
  
  await fetchSession()
  
  // If authenticated, redirect away from auth pages
  if (isAuthenticated.value) {
    return navigateTo('/dashboard')
  }
})
```

Apply to auth pages:

```vue
<!-- pages/auth/signin.vue -->
<script setup>
definePageMeta({
  middleware: 'guest',
})
</script>
```

### Step 5: Server-Side Route Protection

Protect server API routes:

```typescript
// server/api/protected/users.ts
import { auth } from "~/server/utils/auth"

export default defineEventHandler(async (event) => {
  // Get session from request headers
  const session = await auth.api.getSession({
    headers: event.node.req.headers,
  })
  
  if (!session) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized',
    })
  }
  
  // Access user from session
  const userId = session.user.id
  
  // Your protected logic here
  return { message: 'Protected data', userId }
})
```

### Step 6: Create Utility for Server Auth

Create reusable server auth utility:

```typescript
// server/utils/requireAuth.ts
import { auth } from "~/server/utils/auth"
import type { H3Event } from "h3"

export async function requireAuth(event: H3Event) {
  const session = await auth.api.getSession({
    headers: event.node.req.headers,
  })
  
  if (!session) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized',
    })
  }
  
  return session
}
```

Use in API routes:

```typescript
// server/api/protected/data.ts
import { requireAuth } from "~/server/utils/requireAuth"

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  
  // session.user is available
  return { data: 'protected', user: session.user }
})
```

### Step 7: Role-Based Access (Optional)

If you have roles, extend the middleware:

```typescript
// middleware/role.ts
export default defineNuxtRouteMiddleware(async (to, from) => {
  const { user, isAuthenticated, fetchSession } = useAuth()
  
  await fetchSession()
  
  if (!isAuthenticated.value) {
    return navigateTo('/auth/signin')
  }
  
  const requiredRole = to.meta.role
  if (requiredRole && user.value?.role !== requiredRole) {
    throw createError({
      statusCode: 403,
      message: 'Forbidden',
    })
  }
})
```

Use with meta:

```vue
<!-- pages/admin.vue -->
<script setup>
definePageMeta({
  middleware: 'role',
  role: 'admin',
})
</script>
```

## Configuration

### Middleware Execution Order

Nuxt executes middleware in order:
1. Global middleware (in `nuxt.config.ts`)
2. Layout middleware
3. Page middleware

### Route Meta

Use route meta for additional protection info:

```vue
<script setup>
definePageMeta({
  middleware: 'auth',
  requiresAuth: true,
  roles: ['admin', 'user'], // Optional
})
</script>
```

## Key Files

- `middleware/auth.ts` - Authentication middleware
- `middleware/guest.ts` - Guest-only middleware (optional)
- `server/utils/requireAuth.ts` - Server-side auth utility
- Protected pages with `definePageMeta({ middleware: 'auth' })`

## Notes & Gotchas

- **Loading State**: Handle loading state when checking authentication
- **Redirect Loops**: Be careful not to create redirect loops between protected and auth pages
- **SSR**: Middleware runs on both server and client, ensure session is available on both
- **Meta Fields**: Use `definePageMeta` for page-specific configuration
- **Server Routes**: Always validate authentication in server routes, don't rely only on client middleware

## Common Patterns

### Redirect After Login

```typescript
// middleware/auth.ts
const redirect = to.query.redirect || '/dashboard'
return navigateTo(`/auth/signin?redirect=${encodeURIComponent(to.fullPath)}`)
```

### Conditional Protection

```typescript
// middleware/conditional-auth.ts
export default defineNuxtRouteMiddleware(async (to) => {
  // Only protect certain routes
  if (to.path.startsWith('/admin')) {
    const { isAuthenticated } = useAuth()
    if (!isAuthenticated.value) {
      return navigateTo('/auth/signin')
    }
  }
})
```

## Testing

Test protected routes:

1. **Unauthenticated Access**: Try accessing `/dashboard` without login → should redirect to `/auth/signin`
2. **Authenticated Access**: Login, then access `/dashboard` → should work
3. **Redirect**: After login, should redirect back to original destination
4. **Server Routes**: Test API routes return 401 when unauthenticated

## Next Steps

- [Forced Onboarding](../04-onboarding/forced-onboarding.md) - Add onboarding check to middleware
- [Initial Tests](../07-testing/initial-tests.md) - Test authentication flows
