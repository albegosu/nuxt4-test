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
const { signIn, getSession } = useAuth()

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

const needsOnboarding = (session: any) => {
  // Check if user needs onboarding (e.g., no tenant assigned)
  return !session?.user?.tenantId || !session?.user?.onboardingCompleted
}

const handleSignIn = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const result = await signIn(email.value, password.value)
    
    if (result.error) {
      error.value = result.error.message || 'Sign in failed'
    } else {
      // Check if onboarding is needed
      const sessionData = await getSession()
      if (needsOnboarding(sessionData)) {
        await navigateTo('/onboarding/company-setup')
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
</script>
