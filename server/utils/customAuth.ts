import { compare, hash } from "bcryptjs"
import { randomBytes } from "crypto"
import prisma from "./prisma"

// Session configuration
const SESSION_SECRET = process.env.BETTER_AUTH_SECRET || process.env.AUTH_SECRET || "dev-secret-change-in-production"
const SESSION_MAX_AGE = 30 * 24 * 60 * 60 // 30 days in seconds

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return hash(password, 10)
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return compare(password, hash)
}

/**
 * Generate a secure random session token
 */
export function generateSessionToken(): string {
  return randomBytes(32).toString("hex")
}

/**
 * Create a session for a user
 */
export async function createSession(userId: string): Promise<{ sessionToken: string; expires: Date }> {
  const sessionToken = generateSessionToken()
  const expires = new Date(Date.now() + SESSION_MAX_AGE * 1000)

  await prisma.session.create({
    data: {
      sessionToken,
      userId,
      expires,
    },
  })

  return { sessionToken, expires }
}

/**
 * Get session by token
 */
export async function getSession(sessionToken: string) {
  const session = await prisma.session.findUnique({
    where: { sessionToken },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          image: true,
          tenantId: true,
          onboardingCompleted: true,
          emailVerified: true,
        },
      },
    },
  })

  // Check if session is expired
  if (!session || session.expires < new Date()) {
    if (session) {
      // Delete expired session
      await prisma.session.delete({ where: { id: session.id } })
    }
    return null
  }

  return session
}

/**
 * Delete a session
 */
export async function deleteSession(sessionToken: string): Promise<void> {
  await prisma.session.deleteMany({
    where: { sessionToken },
  })
}

/**
 * Delete all sessions for a user
 */
export async function deleteUserSessions(userId: string): Promise<void> {
  await prisma.session.deleteMany({
    where: { userId },
  })
}

/**
 * Clean up expired sessions (can be run as a cron job)
 */
export async function cleanupExpiredSessions(): Promise<number> {
  const result = await prisma.session.deleteMany({
    where: {
      expires: {
        lt: new Date(),
      },
    },
  })

  return result.count
}
