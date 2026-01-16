import { useRuntimeConfig } from "#app"

export const useAuth = () => {
  const config = useRuntimeConfig()
  const authUrl = config.public.betterAuthUrl || 'http://localhost:3000'

  const user = ref(null)
  const session = ref(null)
  const loading = ref(true)

  // Get current session
  const fetchSession = async () => {
    try {
      loading.value = true
      const response = await fetch(`${authUrl}/api/auth/get-session`, {
        credentials: "include",
      })
      
      if (!response.ok) {
        session.value = null
        user.value = null
        return null
      }
      
      const data = await response.json()
      
      if (data && data.user) {
        session.value = data.session
        user.value = data.user
        return data
      }
      
      session.value = null
      user.value = null
      return null
    } catch (error) {
      console.error("Session fetch error:", error)
      session.value = null
      user.value = null
      return null
    } finally {
      loading.value = false
    }
  }

  // Check if user is authenticated
  const isAuthenticated = computed(() => {
    return !!session.value && !!user.value
  })

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      const response = await fetch(`${authUrl}/api/auth/signin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      })

      const result = await response.json()
      
      if (response.ok && result.success) {
        // Update session and user after successful sign-in
        session.value = result.session
        user.value = result.user
        return { success: true, user: result.user }
      }
      
      return { 
        success: false, 
        error: result.message || "Sign in failed" 
      }
    } catch (error: any) {
      console.error("Sign in error:", error)
      return { 
        success: false, 
        error: error.message || "Sign in failed" 
      }
    }
  }

  // Sign up with email and password
  const signUp = async (email: string, password: string, name?: string) => {
    try {
      const response = await fetch(`${authUrl}/api/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password, name }),
      })

      const result = await response.json()
      
      if (response.ok && result.success) {
        // Auto sign-in after successful sign-up
        return await signIn(email, password)
      }
      
      return { 
        success: false, 
        error: result.message || "Sign up failed" 
      }
    } catch (error: any) {
      console.error("Sign up error:", error)
      return { 
        success: false, 
        error: error.message || "Sign up failed" 
      }
    }
  }

  // Sign out
  const signOut = async () => {
    try {
      const response = await fetch(`${authUrl}/api/auth/signout`, {
        method: "POST",
        credentials: "include",
      })
      
      const result = await response.json()
      
      // Clear local state regardless of response
      session.value = null
      user.value = null
      
      return { success: result.success || true }
    } catch (error) {
      console.error("Sign out error:", error)
      // Clear local state even on error
      session.value = null
      user.value = null
      return { success: false, error: "Sign out failed" }
    }
  }

  // Initialize session on composable creation
  onMounted(() => {
    fetchSession()
  })

  return {
    user: readonly(user),
    session: readonly(session),
    loading: readonly(loading),
    isAuthenticated,
    fetchSession,
    signIn,
    signUp,
    signOut,
  }
}
