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
