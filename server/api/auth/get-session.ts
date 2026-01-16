import { getSession } from "~/server/utils/customAuth"

// Get current session endpoint
export default defineEventHandler(async (event) => {
  try {
    // Get session token from cookie
    const sessionToken = getCookie(event, "auth.session_token")

    if (!sessionToken) {
      return {
        session: null,
        user: null,
      }
    }

    // Get session from database
    const session = await getSession(sessionToken)

    if (!session) {
      // Clear invalid session cookie
      setCookie(event, "auth.session_token", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 0,
        path: "/",
      })

      return {
        session: null,
        user: null,
      }
    }

    // Return session and user data
    return {
      session: {
        id: session.id,
        sessionToken: session.sessionToken,
        expires: session.expires.toISOString(),
      },
      user: session.user,
    }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      message: error.message || "Failed to get session",
    })
  }
})
