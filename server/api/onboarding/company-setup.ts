import { requireAuth } from "~/server/utils/requireAuth"
import prisma from "~/server/utils/prisma"

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  const body = await readBody(event)
  
  const { cif, name } = body
  
  if (!cif || !name) {
    throw createError({
      statusCode: 400,
      message: 'CIF and name are required',
    })
  }
  
  // Check if CIF already exists
  const existingTenant = await prisma.tenant.findUnique({
    where: { cif },
  })
  
  if (existingTenant) {
    throw createError({
      statusCode: 409,
      message: 'Company with this CIF already exists',
    })
  }
  
  // Create tenant and link user
  const tenant = await prisma.tenant.create({
    data: {
      cif,
      name,
      users: {
        connect: { id: session.user.id },
      },
    },
  })
  
  return { tenant }
})
