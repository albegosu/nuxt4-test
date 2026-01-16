import type { H3Event } from "h3"
import { getSession } from "./customAuth"

/**
 * Require authentication in server routes
 * Throws 401 error if user is not authenticated
 * Returns session with user data if authenticated
 */
export async function requireAuth(event: H3Event) {
  // Get session token from cookie
  const sessionToken = getCookie(event, "auth.session_token")

  if (!sessionToken) {
    throw createError({
      statusCode: 401,
      message: "Unauthorized - No session token",
    })
  }

  // Get session from database
  const session = await getSession(sessionToken)

  if (!session || !session.user) {
    // Clear invalid session cookie
    setCookie(event, "auth.session_token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    })

    throw createError({
      statusCode: 401,
      message: "Unauthorized - Invalid or expired session",
    })
  }

  return {
    session: {
      id: session.id,
      sessionToken: session.sessionToken,
      expires: session.expires,
    },
    user: session.user,
  }
}

/**
 * Get session if available, but don't throw error if not authenticated
 * Useful for optional authentication
 */
export async function getOptionalAuth(event: H3Event) {
  try {
    return await requireAuth(event)
  } catch {
    return null
  }
}
