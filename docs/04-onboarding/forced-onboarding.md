# Forced Onboarding

## Purpose

Implement forced onboarding flow that redirects users to company setup after their first login. Users must complete company configuration (Tenant setup with CIF) before accessing the main application.

## Dependencies

- Authentication configured (see [Better Auth Setup](../03-authentication/better-auth-setup.md))
- Database schema with Tenant and User models (see [Schema Design](../02-database/schema-design.md))
- Protected routes working (see [Protected Routes](../03-authentication/protected-routes.md))

## Step-by-Step Setup

### Step 1: Update User Model for Onboarding Tracking

Add onboarding status to User model in Prisma schema (if not already present):

```prisma
model User {
  id                  String   @id @default(cuid())
  email               String   @unique
  name                String?
  tenantId            String?
  tenant              Tenant?  @relation(fields: [tenantId], references: [id])
  onboardingCompleted Boolean  @default(false)
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
  
  @@map("users")
}
```

Run migration:

```bash
npx prisma migrate dev --name add_onboarding_status
npx prisma generate
```

### Step 2: Create Onboarding Check Utility

Create `utils/onboarding.ts`:

```typescript
export const checkOnboardingStatus = (user: any): boolean => {
  // User needs onboarding if:
  // 1. Onboarding not completed, OR
  // 2. No tenant assigned
  return !user?.onboardingCompleted || !user?.tenantId
}

export const needsOnboarding = (user: any): boolean => {
  return checkOnboardingStatus(user)
}
```

### Step 3: Create Onboarding Middleware

Create `middleware/onboarding.ts`:

```typescript
export default defineNuxtRouteMiddleware(async (to, from) => {
  const { user, isAuthenticated, fetchSession } = useAuth()
  
  // Only check for authenticated users
  if (!isAuthenticated.value) {
    return
  }
  
  // Fetch fresh user data
  await fetchSession()
  
  // Skip onboarding check on onboarding routes
  if (to.path.startsWith('/onboarding')) {
    return
  }
  
  // Check if user needs onboarding
  if (needsOnboarding(user.value)) {
    return navigateTo('/onboarding/company-setup')
  }
})
```

### Step 4: Create Company Setup Page

Create `pages/onboarding/company-setup.vue`:

```vue
<template>
  <div class="onboarding-page">
    <h1>Complete Your Company Setup</h1>
    <p>Please provide your company information to get started.</p>
    
    <form @submit.prevent="handleCompanySetup">
      <div>
        <label>Company CIF</label>
        <input 
          v-model="form.cif" 
          type="text" 
          required 
          placeholder="B12345678"
        />
        <small>CIF number (unique identifier)</small>
      </div>
      
      <div>
        <label>Company Name</label>
        <input 
          v-model="form.name" 
          type="text" 
          required 
          placeholder="Your Company Name"
        />
      </div>
      
      <button type="submit" :disabled="loading">
        {{ loading ? 'Setting up...' : 'Complete Setup' }}
      </button>
    </form>
    
    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
const { user, fetchSession } = useAuth()

const form = reactive({
  cif: '',
  name: '',
})

const loading = ref(false)
const error = ref('')

const handleCompanySetup = async () => {
  loading.value = true
  error.value = ''
  
  try {
    // Create tenant and link user
    const response = await fetch('/api/onboarding/company-setup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        cif: form.cif,
        name: form.name,
      }),
    })
    
    const result = await response.json()
    
    if (result.error) {
      error.value = result.error.message || 'Failed to setup company'
    } else {
      // Mark onboarding as complete
      await markOnboardingComplete()
      
      // Refresh session to get updated user
      await fetchSession()
      
      // Redirect to dashboard
      await navigateTo('/dashboard')
    }
  } catch (err) {
    error.value = 'An error occurred during setup'
  } finally {
    loading.value = false
  }
}

const markOnboardingComplete = async () => {
  await fetch('/api/onboarding/complete', {
    method: 'POST',
    credentials: 'include',
  })
}
</script>
```

### Step 5: Create Onboarding API Routes

Create `server/api/onboarding/company-setup.ts`:

```typescript
import { requireAuth } from "~/server/utils/requireAuth"
import prisma from "~/server/utils/prisma"

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  const body = await readBody(event)
  
  const { cif, name } = body
  
  if (!cif || !name) {
    throw createError({
      statusCode: 400,
      message: 'CIF and name are required',
    })
  }
  
  // Check if CIF already exists
  const existingTenant = await prisma.tenant.findUnique({
    where: { cif },
  })
  
  if (existingTenant) {
    throw createError({
      statusCode: 409,
      message: 'Company with this CIF already exists',
    })
  }
  
  // Create tenant and link user
  const tenant = await prisma.tenant.create({
    data: {
      cif,
      name,
      users: {
        connect: { id: session.user.id },
      },
    },
  })
  
  return { tenant }
})
```

Create `server/api/onboarding/complete.ts`:

```typescript
import { requireAuth } from "~/server/utils/requireAuth"
import prisma from "~/server/utils/prisma"

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  
  // Mark onboarding as complete
  await prisma.user.update({
    where: { id: session.user.id },
    data: { onboardingCompleted: true },
  })
  
  return { success: true }
})
```

### Step 6: Update Sign Up to Trigger Onboarding

Update sign-up flow to set onboarding flag:

```typescript
// After successful sign up, user will have onboardingCompleted = false
// The middleware will catch this and redirect
```

### Step 7: Update Protected Routes Middleware

Ensure onboarding middleware runs after auth middleware. Update `middleware/auth.ts`:

```typescript
export default defineNuxtRouteMiddleware(async (to, from) => {
  const { isAuthenticated, loading, fetchSession } = useAuth()
  
  if (loading.value) {
    await fetchSession()
  }
  
  if (!isAuthenticated.value) {
    return navigateTo({
      path: '/auth/signin',
      query: { redirect: to.fullPath },
    })
  }
  
  // Onboarding check is handled by separate middleware
  // Ensure it runs after this one
})
```

### Step 8: Apply Middleware Globally (Optional)

Apply onboarding middleware globally in `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  router: {
    middleware: ['onboarding'], // Runs on all routes
  },
})
```

Or apply to specific routes using `definePageMeta`.

## Configuration

### Onboarding Routes

Routes that should skip onboarding check:
- `/onboarding/*` - All onboarding pages
- `/auth/*` - Authentication pages

### Onboarding Criteria

User needs onboarding if:
- `onboardingCompleted === false`, OR
- `tenantId === null`

## Key Files

- `middleware/onboarding.ts` - Onboarding check middleware
- `pages/onboarding/company-setup.vue` - Company setup page
- `server/api/onboarding/company-setup.ts` - Create tenant API
- `server/api/onboarding/complete.ts` - Mark onboarding complete API
- `utils/onboarding.ts` - Onboarding utility functions

## Notes & Gotchas

- **Middleware Order**: Ensure onboarding middleware runs after auth middleware
- **CIF Uniqueness**: Validate CIF uniqueness server-side
- **Session Refresh**: Refresh session after onboarding to get updated user data
- **Redirect Loop**: Be careful not to create redirect loops between onboarding and protected routes
- **Skip Routes**: Ensure onboarding routes themselves don't trigger the middleware

## Enhanced Features (Optional)

### Add First Centro During Setup

Extend company setup to include first center:

```vue
<!-- Add to company-setup.vue -->
<div>
  <label>First Center Name</label>
  <input v-model="form.firstCentro" type="text" required />
</div>
```

Update API to create centro:

```typescript
const tenant = await prisma.tenant.create({
  data: {
    cif,
    name,
    users: { connect: { id: session.user.id } },
    centros: {
      create: {
        name: body.firstCentro,
      },
    },
  },
})
```

### Multi-Step Onboarding

Create multiple onboarding steps:

```vue
<!-- pages/onboarding/index.vue -->
<template>
  <div>
    <OnboardingSteps :current-step="currentStep" />
    <component :is="currentStepComponent" />
  </div>
</template>
```

## Testing

Test onboarding flow:

1. **New User Sign Up**: Sign up new user → should redirect to `/onboarding/company-setup`
2. **Complete Setup**: Fill company info → should redirect to `/dashboard`
3. **Existing User**: Login existing user → should not see onboarding
4. **Protected Routes**: Try accessing `/dashboard` during onboarding → should stay on onboarding

## Next Steps

- [Initial Tests](../07-testing/initial-tests.md) - Test onboarding flow end-to-end
- [Components](../06-components/forms-validation.md) - Improve onboarding form with validation
