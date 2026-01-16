import { hashPassword } from "~/server/utils/customAuth"
import prisma from "~/server/utils/prisma"

// Custom sign-up endpoint
export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { email, password, name } = body

    // Validation
    if (!email || !password) {
      throw createError({
        statusCode: 400,
        message: "Email and password are required",
      })
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      throw createError({
        statusCode: 400,
        message: "Invalid email format",
      })
    }

    // Password strength validation (minimum 8 characters)
    if (password.length < 8) {
      throw createError({
        statusCode: 400,
        message: "Password must be at least 8 characters long",
      })
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      throw createError({
        statusCode: 400,
        message: "User with this email already exists",
      })
    }

    // Hash password
    const passwordHash = await hashPassword(password)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        name: name || null,
        passwordHash,
        emailVerified: false,
        onboardingCompleted: false,
      },
      select: {
        id: true,
        email: true,
        name: true,
        emailVerified: true,
        onboardingCompleted: true,
        createdAt: true,
      },
    })

    return {
      success: true,
      user,
    }
  } catch (error: any) {
    // If it's already an H3 error, throw it as-is
    if (error.statusCode) {
      throw error
    }

    // Otherwise, create a generic error
    throw createError({
      statusCode: 500,
      message: error.message || "Failed to create user",
    })
  }
})
