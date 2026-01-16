# PostgreSQL Setup with Docker - Quick Guide

## Step-by-Step Setup

### Step 1: Start PostgreSQL Container

Start the PostgreSQL container using Docker Compose:

```bash
docker-compose up -d postgres
```

The `-d` flag runs it in detached mode (background). This will:
- Download the PostgreSQL 15 Alpine image (if not already downloaded)
- Create and start a container named `nuxt4-postgres`
- Create a persistent volume for database data
- Expose PostgreSQL on port `5432`

### Step 2: Verify Container is Running

Check if the container is running:

```bash
docker-compose ps
```

You should see the `nuxt4-postgres` container with status `Up (healthy)`.

You can also check with:

```bash
docker ps
```

### Step 3: Configure Environment Variables

Create a `.env` file in the project root (if not exists) with the database URL:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/nuxt4_test?schema=public"
BETTER_AUTH_SECRET="your-secret-key-here"
BETTER_AUTH_URL="http://localhost:3000"
NODE_ENV="development"
```

**Important:** The DATABASE_URL matches the Docker Compose configuration:
- User: `postgres`
- Password: `postgres`
- Host: `localhost` (when connecting from your machine)
- Port: `5432`
- Database: `nuxt4_test`

### Step 4: Test Database Connection (Optional)

You can test the connection using Prisma Studio or directly:

```bash
# Open Prisma Studio (visual database tool)
npm run db:studio

# Or test connection via psql in the container
docker-compose exec postgres psql -U postgres -d nuxt4_test -c "SELECT version();"
```

### Step 5: Run Database Migrations

Create and apply the initial migration:

```bash
npm run db:migrate
```

Or manually:

```bash
npx prisma migrate dev --name init
```

This will:
- Create migration files in `prisma/migrations/`
- Apply the migration to the database
- Generate Prisma Client automatically

### Step 6: Seed the Database

Populate the database with initial data:

```bash
npm run db:seed
```

This will create:
- 2 demo tenants (Empresa Demo 1 & 2)
- Several centros (locations) per tenant
- Demo users linked to tenants

### Step 7: Verify Everything Works

Start the Nuxt development server:

```bash
npm run dev
```

The app should now connect to the PostgreSQL database running in Docker.

## Useful Commands

### Start/Stop PostgreSQL

```bash
# Start PostgreSQL
docker-compose up -d postgres

# Stop PostgreSQL (keeps data)
docker-compose stop postgres

# Stop and remove container (keeps data volume)
docker-compose down

# Stop and remove everything including data (⚠️ WARNING: deletes all data)
docker-compose down -v
```

### View Logs

```bash
# View PostgreSQL logs
docker-compose logs postgres

# Follow logs in real-time
docker-compose logs -f postgres
```

### Access PostgreSQL CLI

```bash
# Connect to PostgreSQL inside the container
docker-compose exec postgres psql -U postgres -d nuxt4_test

# Run a SQL command directly
docker-compose exec postgres psql -U postgres -d nuxt4_test -c "SELECT * FROM tenants;"
```

### Database Management

```bash
# Open Prisma Studio (visual database browser)
npm run db:studio

# Create a new migration
npm run db:migrate

# Reset database (⚠️ WARNING: deletes all data and reseeds)
npx prisma migrate reset

# Check migration status
npx prisma migrate status
```

### Backup/Restore (Optional)

```bash
# Backup database
docker-compose exec postgres pg_dump -U postgres nuxt4_test > backup.sql

# Restore from backup
docker-compose exec -T postgres psql -U postgres nuxt4_test < backup.sql
```

## Troubleshooting

### Port Already in Use

If port 5432 is already in use:

```bash
# Check what's using the port
lsof -i :5432

# Option 1: Stop local PostgreSQL service
# macOS: brew services stop postgresql
# Linux: sudo systemctl stop postgresql

# Option 2: Change port in docker-compose.yml
# Change "5432:5432" to "5433:5432" and update DATABASE_URL
```

### Container Won't Start

```bash
# Check logs for errors
docker-compose logs postgres

# Check if container exists
docker ps -a

# Remove and recreate container
docker-compose down
docker-compose up -d postgres
```

### Connection Refused

1. Verify container is running: `docker-compose ps`
2. Check DATABASE_URL in `.env` file
3. Ensure port 5432 is accessible
4. Check PostgreSQL logs: `docker-compose logs postgres`

### Reset Everything

If you need to start fresh:

```bash
# Stop and remove containers and volumes
docker-compose down -v

# Start fresh
docker-compose up -d postgres

# Wait a few seconds for PostgreSQL to start, then:
npm run db:migrate
npm run db:seed
```

## Production Considerations

For production, you should:

1. **Change default credentials**: Use strong passwords instead of `postgres:postgres`
2. **Use environment variables** for sensitive data
3. **Enable SSL** for database connections
4. **Use managed database services** (AWS RDS, Google Cloud SQL, etc.) instead of Docker for production
5. **Set up backups** and monitoring

## Next Steps

Once PostgreSQL is running:
1. ✅ Verify connection works
2. ✅ Run migrations
3. ✅ Seed initial data
4. ✅ Start Nuxt dev server: `npm run dev`
5. ✅ Test authentication flow
