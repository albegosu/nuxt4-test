import { handlers } from "~/server/utils/auth-js"

// NextAuth handlers need to be wrapped for H3/Nuxt compatibility
// Convert H3 event to Node.js request/response format that NextAuth expects
export default defineEventHandler(async (event) => {
  // Convert H3 event to Node.js request format for NextAuth
  const req = event.node.req
  const res = event.node.res
  
  // Call NextAuth handler
  // @ts-ignore - handlers expect Node.js req/res
  await handlers.GET(req, res)
  
  // Response is already sent by NextAuth handler
  return
})

export const POST = defineEventHandler(async (event) => {
  const req = event.node.req
  const res = event.node.res
  
  // @ts-ignore - handlers expect Node.js req/res
  await handlers.POST(req, res)
  
  return
})
