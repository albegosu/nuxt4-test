# Project Structure

## Purpose

This document outlines the full-stack directory structure for the Nuxt 4 project, including server API routes, composables, layouts, plugins, and other essential directories.

## Dependencies

- Nuxt 4 installed (see [Infrastructure Setup](infrastructure.md))

## Step-by-Step Setup

### Step 1: Create Server Directory Structure

Create the server-side directories:

```bash
mkdir -p server/api
mkdir -p server/middleware
```

The `server/api/` directory will contain API endpoints that automatically become routes (e.g., `server/api/auth/[...].ts` becomes `/api/auth/[...]`)

### Step 2: Create Client-Side Directories

Create directories for client-side code:

```bash
mkdir -p composables
mkdir -p layouts
mkdir -p plugins
mkdir -p middleware
mkdir -p utils
```

### Step 3: Verify Full Structure

Your project should now have this structure:

```
nuxt4-test/
├── server/
│   ├── api/              # API routes (auto-routed)
│   └── middleware/       # Server middleware
├── composables/          # Auto-imported composables
├── layouts/              # Layout components
├── plugins/              # Nuxt plugins
├── middleware/           # Route middleware
├── components/           # Vue components
├── pages/                # File-based routing
├── public/               # Static assets
├── utils/                # Utility functions
├── nuxt.config.ts        # Nuxt configuration
└── package.json          # Dependencies
```

## Directory Details

### server/api/

API routes are automatically converted to server endpoints. Files here create routes under `/api/`.

Example:
- `server/api/auth/[...].ts` → `/api/auth/[...]` endpoint
- `server/api/users/index.ts` → `/api/users` endpoint

### composables/

Composables are auto-imported globally. Create reusable Vue composition functions here.

Example: `composables/useAuth.ts` can be used in any component without importing.

### layouts/

Layout components wrap pages. Create different layouts for different page sections.

Example:
- `layouts/default.vue` - Default layout
- `layouts/auth.vue` - Authentication pages layout

### plugins/

Plugins run at app initialization. Use for:
- Third-party library setup
- Global configuration
- App-wide functionality

### middleware/

Route middleware runs before navigation. Use for:
- Authentication checks
- Route guards
- Redirects

### components/

Vue components. Can be auto-imported or manually imported.

## Configuration

### Auto-imports

Nuxt automatically imports:
- Composables from `composables/`
- Components from `components/`
- Utilities from `utils/`

No need to manually import these in most cases.

### Example Structure Usage

**Composable Example** (`composables/useAuth.ts`):
```typescript
export const useAuth = () => {
  // Auth logic here
  return {
    user: ref(null),
    isAuthenticated: computed(() => !!user.value)
  }
}
```

**Layout Example** (`layouts/default.vue`):
```vue
<template>
  <div>
    <header>Navigation</header>
    <main>
      <slot />
    </main>
    <footer>Footer</footer>
  </div>
</template>
```

**Middleware Example** (`middleware/auth.ts`):
```typescript
export default defineNuxtRouteMiddleware((to, from) => {
  // Check authentication
  // Redirect if not authenticated
})
```

## Key Files

- `server/api/` - API endpoints
- `composables/` - Reusable composition functions
- `layouts/` - Page layout wrappers
- `plugins/` - App initialization code
- `middleware/` - Route guards

## Notes & Gotchas

- **Auto-imports**: Nuxt auto-imports from these directories, so naming matters
- **Server vs Client**: Code in `server/` only runs on the server, never sent to client
- **File-based Routing**: Pages in `pages/` automatically create routes
- **Case Sensitivity**: Directory names are case-sensitive on some systems

## Next Steps

- [Environment Configuration](environment.md) - Set up environment variables
- [Prisma Setup](../02-database/prisma-setup.md) - Database setup
