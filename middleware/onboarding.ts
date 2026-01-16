import { needsOnboarding } from "~/utils/onboarding"

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
