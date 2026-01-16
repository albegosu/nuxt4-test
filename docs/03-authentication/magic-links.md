# Magic Links

## Purpose

Configure passwordless authentication using magic links. This is an optional authentication method that allows users to sign in via email links without passwords.

## Dependencies

- Better Auth installed and configured (see [Better Auth Setup](better-auth-setup.md))
- Email/password auth working
- Email service configured (SMTP or service like SendGrid, Resend, etc.)

## Step-by-Step Setup

### Step 1: Install Magic Link Plugin

Magic links are included in Better Auth, but need to be explicitly enabled:

```typescript
// server/utils/auth.ts
import { betterAuth } from "better-auth"
import { prismaAdapter } from "@better-auth/prisma/adapter"
import { magicLink } from "better-auth/plugins"

export const auth = betterAuth({
  // ... existing config
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    magicLink({
      sendMagicLink: async ({ link, email, type }) => {
        // Implement email sending logic
        console.log(`Magic link for ${email}: ${link}`)
        // TODO: Send email using your email service
        // await sendEmail({ to: email, subject: 'Sign in', html: `<a href="${link}">Sign in</a>` })
      },
    }),
  ],
})
```

### Step 2: Configure Email Service

Choose and configure an email service. Examples:

**Option A: Resend**

```bash
npm install resend
```

```typescript
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

magicLink({
  sendMagicLink: async ({ link, email, type }) => {
    await resend.emails.send({
      from: 'noreply@yourdomain.com',
      to: email,
      subject: type === 'sign-in' ? 'Sign in to your account' : 'Verify your email',
      html: `
        <h1>${type === 'sign-in' ? 'Sign in' : 'Verify your email'}</h1>
        <p>Click the link below to ${type === 'sign-in' ? 'sign in' : 'verify your email'}:</p>
        <a href="${link}">${link}</a>
        <p>This link will expire in 15 minutes.</p>
      `,
    })
  },
})
```

**Option B: Nodemailer (SMTP)**

```bash
npm install nodemailer
```

```typescript
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
})

magicLink({
  sendMagicLink: async ({ link, email, type }) => {
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: type === 'sign-in' ? 'Sign in to your account' : 'Verify your email',
      html: `
        <h1>${type === 'sign-in' ? 'Sign in' : 'Verify your email'}</h1>
        <p>Click the link below:</p>
        <a href="${link}">${link}</a>
      `,
    })
  },
})
```

### Step 3: Update Environment Variables

Add email service configuration to `.env`:

```env
# For Resend
RESEND_API_KEY="your_resend_api_key"

# For SMTP
SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_USER="your_email@example.com"
SMTP_PASSWORD="your_password"
SMTP_FROM="noreply@yourdomain.com"
```

### Step 4: Create Magic Link Sign In Page

Create `pages/auth/magic-link.vue`:

```vue
<template>
  <div class="magic-link-page">
    <h1>Sign in with Magic Link</h1>
    <form @submit.prevent="handleSendMagicLink">
      <div>
        <label>Email</label>
        <input v-model="email" type="email" required />
      </div>
      <button type="submit" :disabled="loading || sent">
        {{ loading ? 'Sending...' : sent ? 'Link sent!' : 'Send Magic Link' }}
      </button>
    </form>
    <p v-if="error">{{ error }}</p>
    <p v-if="sent" class="success">
      Check your email for the magic link!
    </p>
    <NuxtLink to="/auth/signin">Or sign in with password</NuxtLink>
  </div>
</template>

<script setup lang="ts">
const email = ref('')
const loading = ref(false)
const sent = ref(false)
const error = ref('')

const handleSendMagicLink = async () => {
  loading.value = true
  error.value = ''
  sent.value = false
  
  try {
    const response = await fetch('/api/auth/send-magic-link', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ email: email.value }),
    })
    
    const result = await response.json()
    
    if (result.error) {
      error.value = result.error.message || 'Failed to send magic link'
    } else {
      sent.value = true
    }
  } catch (err) {
    error.value = 'An error occurred'
  } finally {
    loading.value = false
  }
}
</script>
```

### Step 5: Handle Magic Link Callback

Better Auth automatically handles the magic link callback at `/api/auth/callback/magic-link?token=...`. The user will be redirected here after clicking the link.

You can customize the redirect after successful magic link verification:

```typescript
// In auth config
magicLink({
  sendMagicLink: async ({ link, email, type }) => {
    // ... email sending
  },
  redirectOnSuccess: "/dashboard", // Custom redirect
})
```

### Step 6: Update Auth Composable

Add magic link method to `composables/useAuth.ts`:

```typescript
const sendMagicLink = async (email: string) => {
  const response = await fetch(`${authUrl}/api/auth/send-magic-link`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ email }),
  })
  return response.json()
}

// Add to return statement
return {
  // ... existing methods
  sendMagicLink,
}
```

## Configuration

### Magic Link Options

```typescript
magicLink({
  sendMagicLink: async ({ link, email, type }) => {
    // Email sending logic
  },
  linkExpirationTime: 60 * 15, // 15 minutes in seconds
  redirectOnSuccess: "/dashboard",
})
```

### Email Template

Create a professional email template:

```typescript
const emailTemplate = ({ link, email, type }) => `
  <!DOCTYPE html>
  <html>
    <body>
      <h1>Welcome!</h1>
      <p>Click the button below to ${type === 'sign-in' ? 'sign in' : 'verify your email'}:</p>
      <a href="${link}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
        ${type === 'sign-in' ? 'Sign In' : 'Verify Email'}
      </a>
      <p>Or copy and paste this link: ${link}</p>
      <p>This link expires in 15 minutes.</p>
    </body>
  </html>
`
```

## Key Files

- `server/utils/auth.ts` - Magic link plugin configuration
- `pages/auth/magic-link.vue` - Magic link request page
- `.env` - Email service credentials
- `composables/useAuth.ts` - Magic link method

## Notes & Gotchas

- **Email Service**: You must configure an email service (Resend, SendGrid, SMTP, etc.)
- **Link Expiration**: Magic links expire after a set time (default: configurable)
- **Development**: For development, you can log links to console instead of sending emails
- **Security**: Magic links are single-use and time-limited
- **UX**: Consider showing a countdown timer or resend option

## Development Mode

For local development without email service, log to console:

```typescript
magicLink({
  sendMagicLink: async ({ link, email, type }) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEV] Magic link for ${email}: ${link}`)
    } else {
      // Production email sending
    }
  },
})
```

## Next Steps

- [Session Management](session-management.md) - Configure session handling
- [Protected Routes](protected-routes.md) - Protect authenticated routes
- [Forced Onboarding](../04-onboarding/forced-onboarding.md) - Add onboarding flow
