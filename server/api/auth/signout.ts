import { deleteSession } from "~/server/utils/customAuth"

// Custom sign-out endpoint
export default defineEventHandler(async (event) => {
  try {
    // Get session token from cookie
    const sessionToken = getCookie(event, "auth.session_token")

    if (sessionToken) {
      // Delete session from database
      await deleteSession(sessionToken)
    }

    // Clear session cookie
    setCookie(event, "auth.session_token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0, // Expire immediately
      path: "/",
    })

    return {
      success: true,
      message: "Signed out successfully",
    }
  } catch (error: any) {
    // Even if there's an error, clear the cookie
    setCookie(event, "auth.session_token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    })

    throw createError({
      statusCode: 500,
      message: error.message || "Failed to sign out",
    })
  }
})
