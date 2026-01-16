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
