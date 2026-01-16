<template>
  <div class="dashboard">
    <h1>Dashboard</h1>
    <p>Welcome to your dashboard!</p>
    <button @click="handleSignOut">Sign Out</button>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
})

const { signOut } = useAuth()

const handleSignOut = async () => {
  await signOut()
  await navigateTo('/auth/signin')
}
</script>
