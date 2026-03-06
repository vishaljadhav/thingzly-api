import { FastifyInstance } from 'fastify';
import { ProductService } from '../services/productService.js';

const service = new ProductService();

export async function productRoutes(app: FastifyInstance): Promise<void> {
  // Get all products
  app.get(
    '/',
    {
      schema: {
        tags: ['Products'],
        summary: 'Get all products',
        description: 'Retrieve a paginated list of all published products',
        querystring: {
          type: 'object',
          properties: {
            page: { type: 'integer', default: 1 },
            limit: { type: 'integer', default: 10 },
          },
        },
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
                    title: { type: 'string' },
                    slug: { type: 'string' },
                    description: { type: 'string', nullable: true },
                    price: { type: 'integer' },
                    currency: { type: 'string' },
                    previewUrl: { type: 'string', nullable: true },
                    status: { type: 'string' },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' },
                    creator: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        displayName: { type: 'string' },
                      },
                    },
                    categories: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          category: {
                            type: 'object',
                            properties: {
                              id: { type: 'string' },
                              name: { type: 'string' },
                              slug: { type: 'string' },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
              pagination: {
                type: 'object',
                properties: {
                  page: { type: 'integer' },
                  limit: { type: 'integer' },
                  total: { type: 'integer' },
                  totalPages: { type: 'integer' },
                },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { page = 1, limit = 10 } = request.query as { page?: number; limit?: number };
      const result = await service.findAll(page, limit);
      return reply.status(200).send(result);
    }
  );

  // Get product by slug
  app.get(
    '/:slug',
    {
      schema: {
        tags: ['Products'],
        summary: 'Get product by slug',
        description: 'Retrieve detailed information about a specific product',
        params: {
          type: 'object',
          properties: {
            slug: { type: 'string' },
          },
          required: ['slug'],
        },
        response: {
          200: {
            type: 'object',
            properties: {
              data: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  title: { type: 'string' },
                  slug: { type: 'string' },
                  description: { type: 'string', nullable: true },
                  price: { type: 'integer' },
                  currency: { type: 'string' },
                  previewUrl: { type: 'string', nullable: true },
                  tags: { type: 'array', items: { type: 'string' } },
                  status: { type: 'string' },
                  createdAt: { type: 'string', format: 'date-time' },
                  updatedAt: { type: 'string', format: 'date-time' },
                  creator: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      displayName: { type: 'string' },
                      username: { type: 'string' },
                    },
                  },
                  categories: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        category: {
                          type: 'object',
                          properties: {
                            id: { type: 'string' },
                            name: { type: 'string' },
                            slug: { type: 'string' },
                          },
                        },
                      },
                    },
                  },
                  reviews: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        rating: { type: 'integer' },
                        comment: { type: 'string', nullable: true },
                        createdAt: { type: 'string', format: 'date-time' },
                      },
                    },
                  },
                },
              },
            },
          },
          404: {
            type: 'object',
            properties: {
              error: { type: 'string' },
              message: { type: 'string' },
              statusCode: { type: 'integer' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { slug } = request.params as { slug: string };
      const product = await service.findBySlug(slug);

      if (!product) {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'Product not found',
          statusCode: 404,
        });
      }

      return reply.status(200).send({ data: product });
    }
  );
}
