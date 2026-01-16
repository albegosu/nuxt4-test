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
      await navigateTo('/onboarding/company-setup')
    }
  } catch (err) {
    error.value = 'An error occurred during sign up'
  } finally {
    loading.value = false
  }
}
</script>
