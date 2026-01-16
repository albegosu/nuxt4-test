import { requireAuth } from "~/server/utils/requireAuth"
import prisma from "~/server/utils/prisma"

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  
  // Mark onboarding as complete
  await prisma.user.update({
    where: { id: session.user.id },
    data: { onboardingCompleted: true },
  })
  
  return { success: true }
})
