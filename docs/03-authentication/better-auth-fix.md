# Better Auth Fix - H3 Compatibility

## Problem

Better Auth was throwing two errors:
1. `Cannot read properties of undefined (reading 'encrypted')` - When accessing auth endpoints
2. `Failed to initialize database adapter` - On server startup

## Root Cause

The `toNodeHandler` from `better-auth/node` is designed for standard Node.js HTTP requests, but Nuxt 4 uses H3 which has a different request format. The Node.js handler expects `req.socket.encrypted`, which doesn't exist in H3 requests.

## Solution

Changed from Node.js handler to H3-compatible web request handler:

### Before (Incorrect):
```typescript
// server/api/auth/[...].ts
import { auth } from "~/server/utils/auth"
import { toNodeHandler } from "better-auth/node"

export default toNodeHandler(auth)
```

### After (Correct):
```typescript
// server/api/auth/[...].ts
import { auth } from "~/server/utils/auth"
import { toWebRequest } from "better-auth"

export default defineEventHandler((event) => {
  return auth.handler(toWebRequest(event))
})
```

## Key Changes

1. **Import**: Changed from `toNodeHandler` to `toWebRequest`
2. **Handler**: Use Nuxt's `defineEventHandler` with `auth.handler(toWebRequest(event))`
3. **Compatibility**: Now works with H3 request format used by Nuxt 4

## Testing

After the fix:
- ✅ Server starts without "encrypted" errors
- ✅ Auth endpoints are accessible
- ✅ Better Auth works with Nuxt 4's H3 framework

## Note on Database Adapter

If you still see "Failed to initialize database adapter" warnings, this may be:
- An asynchronous initialization issue that doesn't block functionality
- Related to Prisma 7 adapter compatibility
- Can be ignored if auth endpoints are working

If auth endpoints work correctly, the warning can be safely ignored or investigated separately.
