# Thingzly API

A high-performance REST API built with Fastify, TypeScript, and PostgreSQL, deployed on DigitalOcean App Platform.

## Tech Stack

- **Runtime**: Node.js 20.x + TypeScript
- **Framework**: Fastify 4.x
- **Database**: PostgreSQL 16 with Prisma ORM
- **Validation**: Zod
- **Documentation**: Swagger/OpenAPI
- **Deployment**: DigitalOcean App Platform
- **CI/CD**: GitHub Actions

## Quick Start

### Prerequisites

- Node.js 20.x
- Docker (for PostgreSQL)

### Development Setup

```bash
# 1. Start PostgreSQL database
docker-compose -f docker-compose.dev.yml up -d

# 2. Install dependencies
npm install

# 3. Setup environment
cp .env.example .env
# Edit .env with your database URL

# 4. Generate Prisma client & run migrations
npm run db:generate
npm run db:migrate

# 5. (Optional) Seed the database
npm run db:seed

# 6. Start development server
npm run dev
```

The API will be available at `http://localhost:3000`

### API Documentation

Once the server is running, visit:
- Swagger UI: `http://localhost:3000/docs`
- Health Check: `http://localhost:3000/api/v1/health`

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | TypeScript type checking |
| `npm run test` | Run tests in watch mode |
| `npm run test:run` | Run tests once |
| `npm run db:migrate` | Create database migration |
| `npm run db:studio` | Open Prisma Studio |

## Project Structure

```
├── .do/                    # DigitalOcean configuration
├── .github/workflows/      # GitHub Actions CI/CD
├── prisma/                 # Database schema & migrations
├── src/
│   ├── config/            # Application configuration
│   ├── lib/               # Shared libraries
│   ├── routes/            # API route handlers
│   ├── services/          # Business logic
│   ├── types/             # TypeScript types & Zod schemas
│   └── utils/             # Utility functions
├── Dockerfile             # Production container
└── docker-compose.yml     # Docker setup
```

## Deployment

This project is configured for automatic deployment to DigitalOcean App Platform.

### Setup

1. Create a DigitalOcean App from `.do/app.yaml`
2. Add GitHub secrets:
   - `DIGITALOCEAN_ACCESS_TOKEN`
   - `DIGITALOCEAN_APP_ID`
3. Push to `main` branch to trigger deployment

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3000 |
| `HOST` | Server host | 0.0.0.0 |
| `NODE_ENV` | Environment | development |
| `DATABASE_URL` | PostgreSQL connection | Required |
| `API_PREFIX` | API route prefix | /api/v1 |
| `CORS_ORIGIN` | CORS allowed origins | * |
| `LOG_LEVEL` | Logging level | info |

## License

ISC