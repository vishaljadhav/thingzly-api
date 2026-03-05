import { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma.js';

export async function healthRoutes(app: FastifyInstance): Promise<void> {
  app.get(
    '/health',
    {
      schema: {
        tags: ['Health'],
        summary: 'Health check endpoint',
        description: 'Returns the health status of the API and database connection',
        response: {
          200: {
            type: 'object',
            properties: {
              status: { type: 'string' },
              timestamp: { type: 'string' },
              database: { type: 'string' },
            },
          },
          503: {
            type: 'object',
            properties: {
              status: { type: 'string' },
              timestamp: { type: 'string' },
              database: { type: 'string' },
              error: { type: 'string' },
            },
          },
        },
      },
    },
    async (_request, reply) => {
      try {
        // Check database connection
        await prisma.$queryRaw`SELECT 1`;

        return reply.status(200).send({
          status: 'healthy',
          timestamp: new Date().toISOString(),
          database: 'connected',
        });
      } catch (error) {
        return reply.status(503).send({
          status: 'unhealthy',
          timestamp: new Date().toISOString(),
          database: 'disconnected',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
  );

  app.get(
    '/ready',
    {
      schema: {
        tags: ['Health'],
        summary: 'Readiness check endpoint',
        description: 'Returns whether the API is ready to accept requests',
        response: {
          200: {
            type: 'object',
            properties: {
              ready: { type: 'boolean' },
            },
          },
        },
      },
    },
    async (_request, reply) => {
      return reply.status(200).send({ ready: true });
    }
  );
}
