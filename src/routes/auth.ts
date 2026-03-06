import { FastifyInstance } from 'fastify';
import { UserService } from '../services/userService.js';
import { authenticate } from '../middleware/auth.js';
import { SyncUserSchema, UpdateProfileSchema } from '../types/auth.js';

const userService = new UserService();

export async function authRoutes(app: FastifyInstance): Promise<void> {
  /**
   * GET /auth/me - Get logged in user details
   * Requires valid Cognito JWT token in Authorization header
   */
  app.get(
    '/me',
    {
      preHandler: [authenticate],
      schema: {
        tags: ['Auth'],
        summary: 'Get logged in user details',
        description:
          'Returns the details of the currently authenticated user based on the Cognito JWT token',
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              cognitoUserId: { type: 'string' },
              email: { type: 'string' },
              username: { type: 'string', nullable: true },
              fullName: { type: 'string', nullable: true },
              avatarUrl: { type: 'string', nullable: true },
              role: { type: 'string', enum: ['BUYER', 'CREATOR', 'ADMIN'] },
              isActive: { type: 'boolean' },
              emailVerified: { type: 'boolean' },
              mobileVerified: { type: 'boolean' },
              createdAt: { type: 'string' },
              updatedAt: { type: 'string' },
            },
          },
          401: {
            type: 'object',
            properties: {
              error: { type: 'string' },
              message: { type: 'string' },
              statusCode: { type: 'integer' },
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
      const cognitoUserId = request.user!.cognitoUserId;

      const user = await userService.findByCognitoId(cognitoUserId);

      if (!user) {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'User not found. Please sync your account first.',
          statusCode: 404,
        });
      }

      return reply.status(200).send(user);
    }
  );

  /**
   * POST /auth/sync - Sync/register user from Cognito
   * Creates a new user or updates existing user data from Cognito
   */
  app.post(
    '/sync',
    {
      preHandler: [authenticate],
      schema: {
        tags: ['Auth'],
        summary: 'Sync user from Cognito',
        description:
          'Creates or updates a user in the database based on Cognito authentication. Call this after successful Cognito sign-up/sign-in.',
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          required: ['cognitoUserId', 'email'],
          properties: {
            cognitoUserId: { type: 'string' },
            email: { type: 'string', format: 'email' },
            username: { type: 'string' },
            fullName: { type: 'string' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              cognitoUserId: { type: 'string' },
              email: { type: 'string' },
              username: { type: 'string', nullable: true },
              fullName: { type: 'string', nullable: true },
              avatarUrl: { type: 'string', nullable: true },
              role: { type: 'string', enum: ['BUYER', 'CREATOR', 'ADMIN'] },
              isActive: { type: 'boolean' },
              emailVerified: { type: 'boolean' },
              mobileVerified: { type: 'boolean' },
              createdAt: { type: 'string' },
              updatedAt: { type: 'string' },
            },
          },
          201: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              cognitoUserId: { type: 'string' },
              email: { type: 'string' },
              username: { type: 'string', nullable: true },
              fullName: { type: 'string', nullable: true },
              avatarUrl: { type: 'string', nullable: true },
              role: { type: 'string', enum: ['BUYER', 'CREATOR', 'ADMIN'] },
              isActive: { type: 'boolean' },
              emailVerified: { type: 'boolean' },
              mobileVerified: { type: 'boolean' },
              createdAt: { type: 'string' },
              updatedAt: { type: 'string' },
            },
          },
          400: {
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
      const data = SyncUserSchema.parse(request.body);

      // Ensure the cognitoUserId in the body matches the authenticated user
      if (data.cognitoUserId !== request.user!.cognitoUserId) {
        return reply.status(403).send({
          error: 'Forbidden',
          message: 'Cognito user ID mismatch',
          statusCode: 403,
        });
      }

      // Check if user already exists
      const existingUser = await userService.findByCognitoId(data.cognitoUserId);
      const user = await userService.syncUser(data);

      return reply.status(existingUser ? 200 : 201).send(user);
    }
  );

  /**
   * PATCH /auth/profile - Update logged in user's profile
   */
  app.patch(
    '/profile',
    {
      preHandler: [authenticate],
      schema: {
        tags: ['Auth'],
        summary: 'Update user profile',
        description: 'Update the profile of the currently authenticated user',
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          properties: {
            username: { type: 'string', minLength: 3 },
            fullName: { type: 'string', minLength: 1 },
            avatarUrl: { type: 'string', format: 'uri' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              cognitoUserId: { type: 'string' },
              email: { type: 'string' },
              username: { type: 'string', nullable: true },
              fullName: { type: 'string', nullable: true },
              avatarUrl: { type: 'string', nullable: true },
              role: { type: 'string', enum: ['BUYER', 'CREATOR', 'ADMIN'] },
              isActive: { type: 'boolean' },
              emailVerified: { type: 'boolean' },
              mobileVerified: { type: 'boolean' },
              createdAt: { type: 'string' },
              updatedAt: { type: 'string' },
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
      const data = UpdateProfileSchema.parse(request.body);
      const cognitoUserId = request.user!.cognitoUserId;

      const user = await userService.updateProfile(cognitoUserId, data);

      if (!user) {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'User not found',
          statusCode: 404,
        });
      }

      return reply.status(200).send(user);
    }
  );
}
