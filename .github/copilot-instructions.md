# Thingzly API - AI Coding Instructions

## Architecture Overview

This is a **Fastify-based REST API** deployed on **DigitalOcean App Platform** with **PostgreSQL**. Key structural decisions:

- **Framework**: Fastify with TypeScript for high-performance APIs
- **Database**: DigitalOcean Managed PostgreSQL with Prisma ORM
- **Deployment**: DigitalOcean App Platform with automatic CI/CD
- **Documentation**: OpenAPI/Swagger auto-generated from route schemas

## Technology Stack

| Component | Technology |
|-----------|------------|
| **Runtime** | Node.js 20.x + TypeScript |
| **Framework** | Fastify 4.x |
| **ORM** | Prisma 5.x |
| **Database** | PostgreSQL 16 |
| **Validation** | Zod |
| **Documentation** | Swagger/OpenAPI |
| **Deployment** | DigitalOcean App Platform |
| **CI/CD** | GitHub Actions |
| **Linting** | ESLint + Prettier |
| **Testing** | Vitest |

## Project Structure

```
/
├── .do/                    # DigitalOcean configuration
│   └── app.yaml           # App Platform spec
├── .github/
│   └── workflows/         # GitHub Actions CI/CD
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Database seeding
├── src/
│   ├── config/            # Application configuration
│   ├── lib/               # Shared libraries (Prisma client)
│   ├── routes/            # Fastify route handlers
│   ├── services/          # Business logic layer
│   ├── types/             # TypeScript types & Zod schemas
│   ├── utils/             # Utility functions
│   ├── app.ts             # Fastify app configuration
│   └── server.ts          # Entry point
├── Dockerfile             # Container configuration
├── docker-compose.yml     # Production Docker setup
└── docker-compose.dev.yml # Development Docker setup
```

## Key Development Patterns

### Route Handler Pattern

```typescript
// src/routes/[resource].ts
import { FastifyInstance } from 'fastify';
import { ResourceService } from '../services/resourceService.js';
import { CreateResourceSchema } from '../types/resource.js';

export async function resourceRoutes(app: FastifyInstance): Promise<void> {
  const service = new ResourceService();

  app.get('/', {
    schema: {
      tags: ['Resource'],
      summary: 'Get all resources',
      response: { 200: { /* ... */ } }
    }
  }, async (request, reply) => {
    const result = await service.findAll();
    return reply.send(result);
  });
}
```

### Service Layer Pattern

```typescript
// src/services/[resource]Service.ts
import { prisma } from '../lib/prisma.js';

export class ResourceService {
  async findAll() {
    return prisma.resource.findMany();
  }

  async create(data: CreateResource) {
    return prisma.resource.create({ data });
  }
}
```

### Zod Validation Pattern

```typescript
// src/types/[resource].ts
import { z } from 'zod';

export const CreateResourceSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
});

export type CreateResource = z.infer<typeof CreateResourceSchema>;
```

### Error Handling

All errors are handled by the centralized error handler in `src/utils/errorHandler.ts`:
- Zod validation errors → 400 Bad Request
- Prisma P2002 (unique constraint) → 409 Conflict
- Prisma P2025 (not found) → 404 Not Found
- Unknown errors → 500 Internal Server Error

## Critical Workflows

### Development

```bash
# Start PostgreSQL database
docker-compose -f docker-compose.dev.yml up -d

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with: DATABASE_URL=postgresql://thingzly:thingzly@localhost:5432/thingzly

# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed database (optional)
npm run db:seed

# Start dev server
npm run dev
```

### Testing

```bash
npm run test        # Watch mode
npm run test:run    # Single run
npm run test:coverage
```

### Building

```bash
npm run build       # TypeScript compilation
npm run typecheck   # Type checking only
npm run lint        # ESLint
npm run lint:fix    # Auto-fix lint issues
```

### Database Commands

```bash
npm run db:generate    # Generate Prisma client
npm run db:migrate     # Create migration (dev)
npm run db:migrate:deploy # Apply migrations (prod)
npm run db:push        # Push schema without migration
npm run db:studio      # Open Prisma Studio GUI
npm run db:seed        # Run seed script
```

## API Conventions

### Response Format

**Success Response:**
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

**Error Response:**
```json
{
  "error": "Validation Error",
  "message": "Request validation failed",
  "statusCode": 400,
  "details": [...]
}
```

### API Endpoints

- All endpoints prefixed with `/api/v1`
- Health check: `GET /api/v1/health`
- Swagger docs: `GET /docs`

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 204 | No Content (successful delete) |
| 400 | Bad Request (validation error) |
| 404 | Not Found |
| 409 | Conflict (duplicate) |
| 500 | Internal Server Error |

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3000 |
| `HOST` | Server host | 0.0.0.0 |
| `NODE_ENV` | Environment | development |
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `API_PREFIX` | API route prefix | /api/v1 |
| `CORS_ORIGIN` | CORS allowed origins | * |
| `LOG_LEVEL` | Logging level | info |

## Deployment (DigitalOcean)

### Prerequisites

1. DigitalOcean account
2. GitHub repository connected to DO App Platform
3. Create App from `.do/app.yaml`

### GitHub Secrets Required

| Secret | Description |
|--------|-------------|
| `DIGITALOCEAN_ACCESS_TOKEN` | DO API token |
| `DIGITALOCEAN_APP_ID` | App Platform app ID |

### Deployment Flow

1. Push to `main` branch
2. GitHub Actions runs lint, test, build
3. On success, triggers DO App Platform deployment
4. DO builds container and deploys
5. Prisma migrations run on startup

## Code Style Guidelines

1. **Naming Conventions**
   - Files: `camelCase.ts` (e.g., `userService.ts`)
   - Classes: `PascalCase` (e.g., `UserService`)
   - Functions/variables: `camelCase`
   - Constants: `UPPER_SNAKE_CASE`

2. **Import Order**
   - Node.js built-ins
   - External packages
   - Internal modules (config → lib → routes → services → types → utils)

3. **TypeScript**
   - Always define return types for functions
   - Use `unknown` instead of `any`
   - Prefer interfaces for object shapes
   - Use Zod schemas for runtime validation

4. **API Design**
   - RESTful resource naming
   - Consistent error responses
   - Swagger documentation for all endpoints
   - Input validation with Zod

## Anti-Patterns to Avoid

- Don't put business logic in route handlers (use services)
- Don't use raw SQL queries (use Prisma)
- Don't hardcode configuration values (use environment variables)
- Don't skip Zod validation for request bodies
- Don't forget to add Swagger schema for new endpoints
- Don't commit `.env` files

## Adding New Features

1. **Create Prisma model** in `prisma/schema.prisma`
2. **Run migration**: `npm run db:migrate`
3. **Create types** in `src/types/[resource].ts`
4. **Create service** in `src/services/[resource]Service.ts`
5. **Create routes** in `src/routes/[resource].ts`
6. **Register routes** in `src/app.ts`
7. **Add tests** for the new feature
