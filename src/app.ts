import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import sensible from '@fastify/sensible';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';

import { config } from './config/index.js';
import { healthRoutes } from './routes/health.js';
import { userRoutes } from './routes/users.js';
import { categoryRoutes } from './routes/category.js';
import { productRoutes } from './routes/products.js';
import { authRoutes } from './routes/auth.js';
import { errorHandler } from './utils/errorHandler.js';

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: {
      level: config.logLevel,
      transport:
        config.nodeEnv === 'development'
          ? {
              target: 'pino-pretty',
              options: {
                translateTime: 'HH:MM:ss Z',
                ignore: 'pid,hostname',
              },
            }
          : undefined,
    },
  });

  // Register plugins
  await app.register(cors, {
    origin: config.corsOrigin,
    credentials: true,
  });

  await app.register(helmet, {
    contentSecurityPolicy: false,
  });

  await app.register(sensible);

  // Swagger documentation
  await app.register(swagger, {
    openapi: {
      info: {
        title: 'Thingzly API',
        description: 'API documentation for Thingzly',
        version: '1.0.0',
      },
      servers: [
        {
          url: `http://${config.host}:${config.port}`,
          description: 'Development server',
        },
      ],
      tags: [
        { name: 'Health', description: 'Health check endpoints' },
        { name: 'Auth', description: 'Authentication endpoints' },
        { name: 'Users', description: 'CMS User management endpoints' },
        { name: 'Category', description: 'Category management endpoints' },
        { name: 'Products', description: 'Product management endpoints' },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            description: 'AWS Cognito JWT token',
          },
        },
      },
    },
  });

  await app.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: false,
    },
  });

  // Set error handler
  app.setErrorHandler(errorHandler);

  // Register routes
  await app.register(healthRoutes, { prefix: config.apiPrefix });
  await app.register(authRoutes, { prefix: `${config.apiPrefix}/auth` });
  await app.register(userRoutes, { prefix: `${config.apiPrefix}/users` });
  await app.register(categoryRoutes, { prefix: `${config.apiPrefix}/categories` });
  await app.register(productRoutes, { prefix: `${config.apiPrefix}/products` });

  return app;
}
