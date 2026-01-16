# Initial Tests

## Purpose

Establish testing approach and validation checklist for the Nuxt 4 application. This includes testing authentication flows, database connections, API endpoints, and end-to-end user flows.

## Dependencies

- All previous phases completed
- Understanding of testing concepts
- (Optional) Testing framework installed

## Testing Strategy

### Manual Testing Checklist

Use this checklist for initial validation before implementing automated tests.

### Phase 1: Infrastructure Tests

#### Database Connection
- [ ] PostgreSQL is accessible
- [ ] Prisma Client generates successfully
- [ ] Database migrations run without errors
- [ ] Seed data loads correctly

**How to test:**
```bash
# Test database connection
npx prisma studio
# Should open Prisma Studio and show data

# Test migrations
npx prisma migrate status
# Should show all migrations applied

# Test seed
npm run db:seed
# Should create test data
```

#### Environment Configuration
- [ ] All required environment variables are set
- [ ] `.env` file is not committed to git
- [ ] `.env.example` contains all required variables
- [ ] Runtime config loads correctly

**How to test:**
```bash
# Check env variables
node -e "console.log(process.env.DATABASE_URL)"
# Should output database URL (if set)

# Check git ignores .env
git check-ignore .env
# Should output .env
```

### Phase 2: Authentication Tests

#### Sign Up Flow
- [ ] User can access sign up page (`/auth/signup`)
- [ ] Form validation works (email format, password requirements)
- [ ] Successful sign up creates user in database
- [ ] After sign up, redirects to onboarding

**Test steps:**
1. Navigate to `/auth/signup`
2. Fill form with invalid data → should show validation errors
3. Fill form with valid data → should create account
4. Check database: `SELECT * FROM users WHERE email = 'test@example.com'`
5. Verify redirect to `/onboarding/company-setup`

#### Sign In Flow
- [ ] User can access sign in page (`/auth/signin`)
- [ ] Invalid credentials show error message
- [ ] Valid credentials create session
- [ ] Session persists across page refreshes
- [ ] After sign in, redirects appropriately (onboarding or dashboard)

**Test steps:**
1. Navigate to `/auth/signin`
2. Try invalid credentials → should show error
3. Use valid credentials → should sign in
4. Refresh page → should remain signed in
5. Check session: `useAuth().session` should have data

#### Sign Out Flow
- [ ] Sign out button works
- [ ] Session is cleared
- [ ] Redirects to sign in page
- [ ] Protected routes are no longer accessible

**Test steps:**
1. While signed in, click sign out
2. Verify redirect to `/auth/signin`
3. Try accessing `/dashboard` → should redirect to sign in
4. Check session: `useAuth().session` should be null

#### Protected Routes
- [ ] Unauthenticated users cannot access protected routes
- [ ] Redirect to sign in with return URL
- [ ] After login, redirects back to original destination
- [ ] Authenticated users can access protected routes

**Test steps:**
1. While signed out, try accessing `/dashboard`
2. Should redirect to `/auth/signin?redirect=/dashboard`
3. Sign in → should redirect to `/dashboard`
4. While signed in, access `/dashboard` → should work

### Phase 3: Onboarding Tests

#### Forced Onboarding
- [ ] New user is redirected to onboarding after sign up
- [ ] Cannot access dashboard without completing onboarding
- [ ] Onboarding form validates required fields (CIF, name)
- [ ] CIF uniqueness is validated
- [ ] Successful onboarding creates tenant and links user
- [ ] After onboarding, redirects to dashboard
- [ ] Subsequent logins skip onboarding

**Test steps:**
1. Sign up new user
2. Verify redirect to `/onboarding/company-setup`
3. Try accessing `/dashboard` → should stay on onboarding
4. Submit form with existing CIF → should show error
5. Submit form with valid data → should create tenant
6. Verify redirect to `/dashboard`
7. Sign out and sign back in → should go directly to dashboard

### Phase 4: Database Tests

#### Multi-Tenant Isolation
- [ ] Users can only see data from their tenant
- [ ] Creating records links to correct tenant
- [ ] Queries filter by tenantId

**Test steps:**
1. Create two tenants (Tenant A, Tenant B)
2. Create users for each tenant
3. Sign in as User A (Tenant A)
4. Create centro → should be linked to Tenant A
5. List centros → should only show Tenant A centros
6. Sign in as User B (Tenant B)
7. List centros → should only show Tenant B centros

#### CRUD Operations
- [ ] Create: Can create new records
- [ ] Read: Can fetch records
- [ ] Update: Can update records
- [ ] Delete: Can delete records (if applicable)

**Test steps:**
1. Create a centro via API/form
2. Verify in database: `SELECT * FROM centros`
3. Update centro via API/form
4. Verify update in database
5. Delete centro (if allowed)
6. Verify deletion in database

### Phase 5: API Endpoint Tests

#### Server Routes
- [ ] API routes are accessible
- [ ] Authentication is required where needed
- [ ] Requests return correct status codes
- [ ] Responses have correct data format

**Test endpoints:**
```bash
# Test protected endpoint (should return 401)
curl http://localhost:3000/api/protected/data

# Test with authentication (use session cookie)
# Sign in first, then:
curl http://localhost:3000/api/protected/data --cookie "session=..."
```

### Phase 6: Component Tests

#### Forms
- [ ] Form validation works
- [ ] Error messages display correctly
- [ ] Successful submission works
- [ ] Loading states display

**Test steps:**
1. Access form page
2. Submit empty form → should show validation errors
3. Fill form with invalid data → should show specific errors
4. Fill form correctly → should submit successfully

#### Tables
- [ ] Data displays correctly
- [ ] Editing works (if editable)
- [ ] Saving updates data
- [ ] Deletion works (if deletable)

**Test steps:**
1. Access table page
2. Verify data displays
3. Click edit → should enter edit mode
4. Make changes and save → should update
5. Click delete → should remove row

#### Charts
- [ ] Charts render correctly
- [ ] Data displays accurately
- [ ] Charts are responsive

**Test steps:**
1. Access page with charts
2. Verify charts render
3. Check data accuracy
4. Resize window → charts should adjust

## Automated Testing (Optional)

### Setup Testing Framework

```bash
npm install -D vitest @vue/test-utils
```

### Example Unit Test

Create `tests/utils/onboarding.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { needsOnboarding } from '~/utils/onboarding'

describe('onboarding', () => {
  it('needs onboarding when onboardingCompleted is false', () => {
    const user = { onboardingCompleted: false }
    expect(needsOnboarding(user)).toBe(true)
  })

  it('does not need onboarding when completed', () => {
    const user = { onboardingCompleted: true, tenantId: '123' }
    expect(needsOnboarding(user)).toBe(false)
  })
})
```

### Run Tests

```bash
npm run test
```

## Key Test Areas

### Critical Paths
1. **Authentication**: Sign up → Sign in → Access protected route
2. **Onboarding**: Sign up → Complete onboarding → Access dashboard
3. **Data Isolation**: Multi-tenant data separation
4. **Session Management**: Session persistence and expiration

### Edge Cases
- Invalid input handling
- Network errors
- Session expiration
- Concurrent requests
- Large datasets

## Debugging Tips

### Database Debugging

```bash
# Open Prisma Studio
npx prisma studio

# Check migrations
npx prisma migrate status

# View database directly
docker-compose exec postgres psql -U postgres -d nuxt4_test
```

### Authentication Debugging

```typescript
// In browser console or component
const { user, session, isAuthenticated } = useAuth()
console.log({ user, session, isAuthenticated })
```

### API Debugging

```typescript
// In server routes
console.log('Request:', event.node.req.url)
console.log('Session:', session)
```

## Test Checklist Summary

Before considering the project ready:

- [ ] All infrastructure tests pass
- [ ] All authentication flows work
- [ ] Onboarding flow works end-to-end
- [ ] Multi-tenant isolation verified
- [ ] All CRUD operations work
- [ ] Protected routes are secured
- [ ] Components render correctly
- [ ] Forms validate properly
- [ ] Tables display and edit correctly
- [ ] Charts render with data

## Next Steps

After initial testing:

1. Fix any identified issues
2. Add automated tests for critical paths
3. Set up CI/CD testing pipeline
4. Add E2E tests for complete user flows
5. Performance testing for large datasets

## Notes & Gotchas

- **Test Data**: Use seed data for consistent testing
- **Clean State**: Reset database between test runs if needed
- **Session Cookies**: Browser DevTools → Application → Cookies to inspect sessions
- **Network Tab**: Use browser DevTools to inspect API calls
- **Console Errors**: Check browser and server console for errors
