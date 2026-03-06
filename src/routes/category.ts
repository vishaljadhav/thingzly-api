import { FastifyInstance } from 'fastify';
import { CategoryService } from '../services/categoryService.js';

const service = new CategoryService();

export async function categoryRoutes(app: FastifyInstance): Promise<void> {
  app.get(
    '/',
    {
      schema: {
        tags: ['Category'],
        summary: 'Get all categories',
        description: 'Retrieve a list of all categories',
        response: {
          200: {
            type: 'object',
            properties: {
              data: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                    slug: { type: 'string' },
                    description: { type: 'string', nullable: true },
                    parentId: { type: 'string', nullable: true },
                    createdAt: { type: 'string', format: 'date-time' },
                  },
                },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const categories = await service.findAll();
      return reply.status(200).send({ data: categories });
    }
  );
}
