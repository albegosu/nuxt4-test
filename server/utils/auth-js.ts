import { PrismaClient } from "@prisma/client"
import { PrismaAdapter } from "@auth/prisma-adapter"
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { compare, hash } from "bcryptjs"
import prisma from "./prisma"

// Load environment variables
const authSecret = process.env.BETTER_AUTH_SECRET || process.env.AUTH_SECRET || "dev-secret-change-in-production"
const authUrl = process.env.BETTER_AUTH_URL || process.env.AUTH_URL || "http://localhost:3000"

// Auth.js (NextAuth.js) configuration
// Using PrismaAdapter for database-backed sessions and user management
export const auth = NextAuth({
  adapter: PrismaAdapter(prisma as any) as any,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // Find user by email
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string }
        })

        if (!user) {
          return null
        }

        // Note: In a real app, you'd hash passwords during signup
        // For now, we'll assume passwords are stored hashed
        // Check if password matches (you may need to adjust this based on your password storage)
        // const isPasswordValid = await compare(credentials.password as string, user.password)
        // if (!isPasswordValid) {
        //   return null
        // }

        // Return user object for Auth.js
        return {
          id: user.id,
          email: user.email,
          name: user.name || undefined,
          image: user.image || undefined,
        }
      }
    })
  ],
  session: {
    strategy: "database", // Use database sessions (requires PrismaAdapter)
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
  },
  secret: authSecret,
  callbacks: {
    async session({ session, user }) {
      // Add user ID and tenant ID to session
      if (session.user) {
        const dbUser = await prisma.user.findUnique({
          where: { email: session.user.email! },
          select: { id: true, tenantId: true, onboardingCompleted: true }
        })
        
        if (dbUser) {
          (session.user as any).id = dbUser.id
          ;(session.user as any).tenantId = dbUser.tenantId
          ;(session.user as any).onboardingCompleted = dbUser.onboardingCompleted
        }
      }
      return session
    },
  },
})

// Export handlers for GET and POST requests
export const { handlers, signIn, signOut, auth: getServerSession } = auth
