import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { UserService } from '../services/userService.js';
import { CreateUserSchema, UpdateUserSchema, UserIdParamsSchema } from '../types/user.js';

const userService = new UserService();

export async function userRoutes(app: FastifyInstance): Promise<void> {
  // Get all users
  app.get(
    '/',
    {
      schema: {
        tags: ['Users'],
        summary: 'Get all users',
        description: 'Retrieve a list of all users',
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
                    email: { type: 'string' },
                    name: { type: 'string' },
                    createdAt: { type: 'string' },
                    updatedAt: { type: 'string' },
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
      const result = await userService.findAll(page, limit);
      return reply.status(200).send(result);
    }
  );

  // Get user by ID
  app.get(
    '/:id',
    {
      schema: {
        tags: ['Users'],
        summary: 'Get user by ID',
        description: 'Retrieve a single user by their ID',
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
          required: ['id'],
        },
        response: {
          200: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              email: { type: 'string' },
              name: { type: 'string' },
              createdAt: { type: 'string' },
              updatedAt: { type: 'string' },
            },
          },
          404: {
            type: 'object',
            properties: {
              error: { type: 'string' },
              message: { type: 'string' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { id } = UserIdParamsSchema.parse(request.params);
      const user = await userService.findById(id);

      if (!user) {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'User not found',
        });
      }

      return reply.status(200).send(user);
    }
  );

  // Create user
  app.post(
    '/',
    {
      schema: {
        tags: ['Users'],
        summary: 'Create a new user',
        description: 'Create a new user with the provided data',
        body: {
          type: 'object',
          required: ['email', 'name'],
          properties: {
            email: { type: 'string', format: 'email' },
            name: { type: 'string', minLength: 1 },
          },
        },
        response: {
          201: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              email: { type: 'string' },
              name: { type: 'string' },
              createdAt: { type: 'string' },
              updatedAt: { type: 'string' },
            },
          },
          400: {
            type: 'object',
            properties: {
              error: { type: 'string' },
              message: { type: 'string' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const data = CreateUserSchema.parse(request.body);
      const user = await userService.create(data);
      return reply.status(201).send(user);
    }
  );

  // Update user
  app.put(
    '/:id',
    {
      schema: {
        tags: ['Users'],
        summary: 'Update a user',
        description: 'Update an existing user by their ID',
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
          required: ['id'],
        },
        body: {
          type: 'object',
          properties: {
            email: { type: 'string', format: 'email' },
            name: { type: 'string', minLength: 1 },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              email: { type: 'string' },
              name: { type: 'string' },
              createdAt: { type: 'string' },
              updatedAt: { type: 'string' },
            },
          },
          404: {
            type: 'object',
            properties: {
              error: { type: 'string' },
              message: { type: 'string' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { id } = UserIdParamsSchema.parse(request.params);
      const data = UpdateUserSchema.parse(request.body);

      const user = await userService.update(id, data);

      if (!user) {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'User not found',
        });
      }

      return reply.status(200).send(user);
    }
  );

  // Delete user
  app.delete(
    '/:id',
    {
      schema: {
        tags: ['Users'],
        summary: 'Delete a user',
        description: 'Delete an existing user by their ID',
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
          required: ['id'],
        },
        response: {
          204: {
            type: 'null',
            description: 'User deleted successfully',
          },
          404: {
            type: 'object',
            properties: {
              error: { type: 'string' },
              message: { type: 'string' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { id } = UserIdParamsSchema.parse(request.params);
      const deleted = await userService.delete(id);

      if (!deleted) {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'User not found',
        });
      }

      return reply.status(204).send();
    }
  );
}
