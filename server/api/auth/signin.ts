import { verifyPassword, createSession } from "~/server/utils/customAuth"
import prisma from "~/server/utils/prisma"

// Custom sign-in endpoint
export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { email, password } = body

    // Validation
    if (!email || !password) {
      throw createError({
        statusCode: 400,
        message: "Email and password are required",
      })
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        passwordHash: true,
        tenantId: true,
        onboardingCompleted: true,
        emailVerified: true,
      },
    })

    if (!user) {
      throw createError({
        statusCode: 401,
        message: "Invalid email or password",
      })
    }

    // Check if user has a password (required for email/password auth)
    if (!user.passwordHash) {
      throw createError({
        statusCode: 401,
        message: "Invalid email or password",
      })
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.passwordHash)

    if (!isValidPassword) {
      throw createError({
        statusCode: 401,
        message: "Invalid email or password",
      })
    }

    // Create session
    const { sessionToken, expires } = await createSession(user.id)

    // Set session cookie
    setCookie(event, "auth.session_token", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    })

    // Return user data (without password hash)
    const { passwordHash: _, ...userWithoutPassword } = user

    return {
      success: true,
      session: {
        sessionToken,
        expires: expires.toISOString(),
      },
      user: userWithoutPassword,
    }
  } catch (error: any) {
    // If it's already an H3 error, throw it as-is
    if (error.statusCode) {
      throw error
    }

    // Otherwise, create a generic error
    throw createError({
      statusCode: 500,
      message: error.message || "Failed to sign in",
    })
  }
})
