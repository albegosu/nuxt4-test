# Nuxt 4 Full-Stack Project

A comprehensive full-stack application built with Nuxt 4, featuring multi-tenant architecture, authentication with Better Auth, Prisma ORM with PostgreSQL, and reusable component library. This project serves as a learning roadmap for understanding modern Nuxt development.

## Architecture Overview

This project implements a multi-tenant SaaS architecture with the following technology stack:

- **Framework**: Nuxt 4 (Full-stack with server routes)
- **Authentication**: Better Auth (email/password + optional magic links)
- **Database**: PostgreSQL with Prisma ORM
- **Multi-tenancy**: Shared schema with tenant-based data isolation
- **Containerization**: Docker Compose for local development
- **UI Components**: Reusable forms, editable tables, and charting capabilities

## Quick Start

### Prerequisites

- Node.js 18+ 
- PostgreSQL 14+ (or use Docker Compose)
- npm or pnpm
- Docker and Docker Compose (optional, for local PostgreSQL)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd nuxt4-test

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Edit .env with your configuration

# Setup database (if using Docker)
docker-compose up -d postgres

# Run migrations
npx prisma migrate dev

# Generate Prisma Client
npx prisma generate

# Seed database (optional)
npm run db:seed

# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`

### Testing

```bash
# Test login flow
# Test database connection
# Verify protected routes
# Test onboarding redirect
```

See [docs/07-testing/initial-tests.md](docs/07-testing/initial-tests.md) for detailed testing instructions.

## Project Structure

```
nuxt4-test/
├── server/
│   └── api/           # API routes and endpoints
├── composables/       # Reusable composition functions
├── layouts/           # Page layouts
├── plugins/           # Nuxt plugins
├── components/        # Vue components
├── middleware/        # Route middleware
├── pages/             # File-based routing
├── prisma/            # Prisma schema and migrations
├── docs/              # Learning documentation
└── nuxt.config.ts     # Nuxt configuration
```

## Learning Roadmap

This project follows a structured learning path divided into phases. Each phase has detailed documentation in the `docs/` folder.

### Phase 1: Infrastructure & Base Setup
- [x] Nuxt 4 project initialization
- [x] Full-stack structure setup
- [x] Environment configuration
- **Docs**: [01-setup/](docs/01-setup/)

### Phase 2: Database Setup
- [ ] Prisma installation and configuration
- [ ] Multi-tenant schema design (Tenant, Centro, User)
- [ ] Initial migrations and seeding
- **Docs**: [02-database/](docs/02-database/)

### Phase 3: Authentication
- [ ] Better Auth installation
- [ ] Email/password authentication
- [ ] Magic links (optional)
- [ ] Session management
- [ ] Protected routes middleware
- **Docs**: [03-authentication/](docs/03-authentication/)

### Phase 4: Onboarding Flow
- [ ] First login redirect logic
- [ ] Company setup flow
- **Docs**: [04-onboarding/](docs/04-onboarding/)

### Phase 5: Docker Setup
- [ ] Docker Compose configuration
- [ ] PostgreSQL containerization
- **Docs**: [05-docker/](docs/05-docker/)

### Phase 6: Reusable Components
- [ ] Form components with validation
- [ ] Editable table components
- [ ] Charting integration
- **Docs**: [06-components/](docs/06-components/)

### Phase 7: Testing & Validation
- [ ] Seed data setup
- [ ] End-to-end flow testing
- **Docs**: [07-testing/](docs/07-testing/)

## Documentation Index

All detailed documentation is organized in the `docs/` folder:

### Setup & Infrastructure
- [Infrastructure Setup](docs/01-setup/infrastructure.md) - Initial Nuxt 4 project setup
- [Project Structure](docs/01-setup/project-structure.md) - Full-stack directory organization
- [Environment Configuration](docs/01-setup/environment.md) - Environment variables and configuration

### Database
- [Prisma Setup](docs/02-database/prisma-setup.md) - Prisma installation and configuration
- [Schema Design](docs/02-database/schema-design.md) - Multi-tenant database models
- [Migrations & Seeding](docs/02-database/migrations-seeding.md) - Database migrations and seed data

### Authentication
- [Better Auth Setup](docs/03-authentication/better-auth-setup.md) - Better Auth installation and configuration
- [Email/Password Auth](docs/03-authentication/email-password-auth.md) - Email/password authentication recipe
- [Magic Links](docs/03-authentication/magic-links.md) - Passwordless authentication (optional)
- [Session Management](docs/03-authentication/session-management.md) - Secure cookies vs JWT
- [Protected Routes](docs/03-authentication/protected-routes.md) - Route protection with middleware

### Onboarding
- [Forced Onboarding](docs/04-onboarding/forced-onboarding.md) - First login redirect to company setup

### Docker
- [Docker Compose](docs/05-docker/docker-compose.md) - Containerization setup

### Components
- [Forms & Validation](docs/06-components/forms-validation.md) - Reusable form components
- [Editable Tables](docs/06-components/editable-tables.md) - Table components with editing
- [Charting](docs/06-components/charting.md) - Chart.js integration

### Testing
- [Initial Tests](docs/07-testing/initial-tests.md) - Testing approach and validation

## Technology Stack

| Technology | Purpose | Version |
|------------|---------|---------|
| Nuxt | Full-stack framework | 4.x |
| Better Auth | Authentication | Latest |
| Prisma | ORM | Latest |
| PostgreSQL | Database | 14+ |
| Docker | Containerization | Latest |
| Vue | Frontend framework | 3.x (via Nuxt) |
| TypeScript | Type safety | Latest |

## Key Features

- 🔐 **Multi-tenant Architecture**: Shared database schema with tenant isolation
- 🔒 **Secure Authentication**: Email/password + optional magic links
- 🎨 **Reusable Components**: Forms, tables, and charts
- 🐳 **Docker Support**: Easy local development environment
- 📚 **Learning Roadmap**: Comprehensive documentation for each phase
- ✅ **Type Safety**: Full TypeScript support

## Contributing

This is a learning project. Feel free to follow along, experiment, and adapt the code to your needs.

## License

[Add your license here]

## Next Steps

1. Review the [Infrastructure Setup](docs/01-setup/infrastructure.md) guide
2. Follow the roadmap phases sequentially
3. Refer to individual documentation files for detailed instructions
4. Check off completed phases in the roadmap above

---

**Status**: Documentation structure in progress. Follow the learning roadmap to implement each phase.
