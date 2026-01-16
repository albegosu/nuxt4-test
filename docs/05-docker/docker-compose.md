# Docker Compose Setup

## Purpose

Set up Docker Compose for local development with PostgreSQL and optionally the Nuxt application. This provides a consistent development environment that's easy to set up and tear down.

## Dependencies

- Docker Desktop installed (or Docker Engine + Docker Compose)
- Understanding of Docker basics

## Step-by-Step Setup

### Step 1: Create Docker Compose File

Create `docker-compose.yml` in the project root:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: nuxt4-postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: nuxt4_test
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
```

### Step 2: Update Environment Variables

Update `.env` to use Docker PostgreSQL:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/nuxt4_test?schema=public"
```

Or if connecting from within Docker network:

```env
DATABASE_URL="postgresql://postgres:postgres@postgres:5432/nuxt4_test?schema=public"
```

### Step 3: Start PostgreSQL Container

Start the PostgreSQL service:

```bash
docker-compose up -d postgres
```

Verify it's running:

```bash
docker-compose ps
```

### Step 4: Run Migrations

With PostgreSQL running, run Prisma migrations:

```bash
npx prisma migrate dev
```

### Step 5: Optional - Add Nuxt Service

If you want to run Nuxt in Docker, add to `docker-compose.yml`:

```yaml
services:
  postgres:
    # ... existing postgres config

  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: nuxt4-app
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@postgres:5432/nuxt4_test?schema=public
      - BETTER_AUTH_SECRET=${BETTER_AUTH_SECRET}
      - BETTER_AUTH_URL=http://localhost:3000
      - NODE_ENV=development
    depends_on:
      postgres:
        condition: service_healthy
    volumes:
      - .:/app
      - /app/node_modules
    command: npm run dev
```

### Step 6: Create Dockerfile (Optional)

Create `Dockerfile` for Nuxt app:

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application files
COPY . .

# Expose port
EXPOSE 3000

# Start development server
CMD ["npm", "run", "dev"]
```

### Step 7: Create .dockerignore

Create `.dockerignore` to exclude unnecessary files:

```
node_modules
.nuxt
.output
dist
.git
.env
.env.local
*.log
.DS_Store
```

## Configuration

### Docker Compose Services

**PostgreSQL Service:**
- Image: `postgres:15-alpine` (lightweight PostgreSQL)
- Port: `5432` (mapped to host)
- Volume: Persistent data storage
- Health check: Ensures PostgreSQL is ready

**Optional App Service:**
- Builds from Dockerfile
- Hot reload with volume mounts
- Depends on PostgreSQL health

### Environment Variables

Docker Compose can read from `.env` file automatically. Variables can be:
- Defined in `docker-compose.yml` directly
- Loaded from `.env` file (Docker Compose does this automatically)
- Passed via environment section

## Key Files

- `docker-compose.yml` - Docker Compose configuration
- `Dockerfile` - Nuxt app container definition (optional)
- `.dockerignore` - Files to exclude from Docker build
- `.env` - Environment variables (used by Docker Compose)

## Useful Commands

### Starting Services

```bash
# Start PostgreSQL
docker-compose up -d postgres

# Start all services
docker-compose up -d

# Start with logs
docker-compose up
```

### Stopping Services

```bash
# Stop services (keeps volumes)
docker-compose stop

# Stop and remove containers (keeps volumes)
docker-compose down

# Stop and remove everything including volumes
docker-compose down -v
```

### Database Management

```bash
# Access PostgreSQL CLI
docker-compose exec postgres psql -U postgres -d nuxt4_test

# View logs
docker-compose logs postgres

# Restart PostgreSQL
docker-compose restart postgres
```

### Prisma Commands with Docker

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Open Prisma Studio (connects to Docker DB)
npx prisma studio
```

## Production Considerations

### Production Docker Compose

For production, create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - app-network
    restart: always

  app:
    build:
      context: .
      dockerfile: Dockerfile.prod
    environment:
      - DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}
      - NODE_ENV=production
    depends_on:
      - postgres
    networks:
      - app-network
    restart: always

networks:
  app-network:
    driver: bridge

volumes:
  postgres_data:
```

### Production Dockerfile

Create `Dockerfile.prod` for production:

```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/.output ./.output

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
```

## Notes & Gotchas

- **Port Conflicts**: Ensure port 5432 is not already in use
- **Volume Persistence**: Data persists in Docker volumes even after container removal
- **Network**: Services in same `docker-compose.yml` can communicate by service name
- **Hot Reload**: Development setup uses volume mounts for hot reload
- **Health Checks**: Health checks ensure services start in correct order
- **Environment Variables**: Docker Compose automatically loads `.env` file

## Troubleshooting

### Port Already in Use

```bash
# Check what's using port 5432
lsof -i :5432

# Stop local PostgreSQL if running
# Or change port mapping in docker-compose.yml
```

### Database Connection Issues

```bash
# Check if PostgreSQL is running
docker-compose ps

# Check PostgreSQL logs
docker-compose logs postgres

# Test connection
docker-compose exec postgres psql -U postgres -c "SELECT 1"
```

### Reset Database

```bash
# Remove volume and recreate
docker-compose down -v
docker-compose up -d postgres
npx prisma migrate dev
```

## Next Steps

- [Initial Tests](../07-testing/initial-tests.md) - Test database connection with Docker
- [Environment Configuration](../01-setup/environment.md) - Review environment setup
