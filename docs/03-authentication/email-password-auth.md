# Email/Password Authentication

## Purpose

Configure the email/password authentication recipe in Better Auth. This enables users to register and sign in using their email and password.

## Dependencies

- Better Auth installed and configured (see [Better Auth Setup](better-auth-setup.md))
- Database models set up for Better Auth
- Auth composable created

## Step-by-Step Setup

### Step 1: Verify Email/Password Configuration

The email/password recipe should already be enabled in your auth config:

```typescript
// server/utils/auth.ts
export const auth = betterAuth({
  // ... other config
  emailAndPassword: {
    enabled: true,
  },
})
```

### Step 2: Create Sign Up Page

Create `pages/auth/signup.vue`:

```vue
<template>
  <div class="signup-page">
    <h1>Sign Up</h1>
    <form @submit.prevent="handleSignUp">
      <div>
        <label>Name</label>
        <input v-model="name" type="text" required />
      </div>
      <div>
        <label>Email</label>
        <input v-model="email" type="email" required />
      </div>
      <div>
        <label>Password</label>
        <input v-model="password" type="password" required />
      </div>
      <button type="submit" :disabled="loading">
        {{ loading ? 'Signing up...' : 'Sign Up' }}
      </button>
    </form>
    <p v-if="error">{{ error }}</p>
    <NuxtLink to="/auth/signin">Already have an account? Sign in</NuxtLink>
  </div>
</template>

<script setup lang="ts">
const { signUp } = useAuth()

const email = ref('')
const password = ref('')
const name = ref('')
const loading = ref(false)
const error = ref('')

const handleSignUp = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const result = await signUp(email.value, password.value, name.value)
    
    if (result.error) {
      error.value = result.error.message || 'Sign up failed'
    } else {
      // Redirect to onboarding or dashboard
      await navigateTo('/onboarding')
    }
  } catch (err) {
    error.value = 'An error occurred during sign up'
  } finally {
    loading.value = false
  }
}
</script>
```

### Step 3: Create Sign In Page

Create `pages/auth/signin.vue`:

```vue
<template>
  <div class="signin-page">
    <h1>Sign In</h1>
    <form @submit.prevent="handleSignIn">
      <div>
        <label>Email</label>
        <input v-model="email" type="email" required />
      </div>
      <div>
        <label>Password</label>
        <input v-model="password" type="password" required />
      </div>
      <button type="submit" :disabled="loading">
        {{ loading ? 'Signing in...' : 'Sign In' }}
      </button>
    </form>
    <p v-if="error">{{ error }}</p>
    <NuxtLink to="/auth/signup">Don't have an account? Sign up</NuxtLink>
  </div>
</template>

<script setup lang="ts">
const { signIn } = useAuth()

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

const handleSignIn = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const result = await signIn(email.value, password.value)
    
    if (result.error) {
      error.value = result.error.message || 'Sign in failed'
    } else {
      // Check if onboarding is needed
      const session = await getSession()
      if (needsOnboarding(session)) {
        await navigateTo('/onboarding')
      } else {
        await navigateTo('/dashboard')
      }
    }
  } catch (err) {
    error.value = 'An error occurred during sign in'
  } finally {
    loading.value = false
  }
}

const { getSession } = useAuth()

const needsOnboarding = (session: any) => {
  // Check if user needs onboarding (e.g., no tenant assigned)
  return !session?.user?.tenantId
}
</script>
```

### Step 4: Update Auth Composable

Enhance `composables/useAuth.ts` with better error handling:

```typescript
export const useAuth = () => {
  const config = useRuntimeConfig()
  const authUrl = config.public.betterAuthUrl

  const signIn = async (email: string, password: string) => {
    const response = await fetch(`${authUrl}/api/auth/sign-in/email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Important for cookies
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
      credentials: "include",
      body: JSON.stringify({ email, password, name }),
    })
    return response.json()
  }

  // ... rest of composable
}
```

### Step 5: Add Password Validation (Optional)

Create a password validation utility:

```typescript
// utils/password.ts
export const validatePassword = (password: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = []
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters')
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number')
  }
  
  return {
    valid: errors.length === 0,
    errors,
  }
}
```

## Configuration

### Password Requirements

Configure password requirements in auth config:

```typescript
emailAndPassword: {
  enabled: true,
  minPasswordLength: 8,
  requireEmailVerification: false, // Set to true for email verification
}
```

### Custom Error Messages

Better Auth provides standard error messages. Customize them in your UI components as shown in the examples above.

## Key Files

- `pages/auth/signup.vue` - Sign up page
- `pages/auth/signin.vue` - Sign in page
- `composables/useAuth.ts` - Auth methods
- `utils/password.ts` - Password validation (optional)

## Notes & Gotchas

- **Credentials**: Always include `credentials: "include"` in fetch requests for cookies
- **Error Handling**: Better Auth returns structured error responses
- **Email Verification**: Consider enabling email verification for production
- **Password Security**: Implement password hashing (Better Auth handles this automatically)
- **Session**: Sessions are stored in cookies automatically

## Testing

Test the flow:
1. Navigate to `/auth/signup`
2. Create a new account
3. Navigate to `/auth/signin`
4. Sign in with credentials
5. Verify session is created

## Next Steps

- [Magic Links](magic-links.md) - Add passwordless authentication (optional)
- [Session Management](session-management.md) - Configure session handling
- [Protected Routes](protected-routes.md) - Protect authenticated routes
