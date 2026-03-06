import { FastifyRequest, FastifyReply } from 'fastify';
import { CognitoJwtVerifier } from 'aws-jwt-verify';
import { config } from '../config/index.js';
import { UserService } from '../services/userService.js';

// Create the Cognito JWT verifier
const verifier = CognitoJwtVerifier.create({
  userPoolId: config.cognito.userPoolId,
  tokenUse: 'access',
  clientId: config.cognito.clientId,
});

export interface AuthenticatedUser {
  cognitoUserId: string;
  email?: string;
  username?: string;
}

// Extend FastifyRequest to include user
declare module 'fastify' {
  interface FastifyRequest {
    user?: AuthenticatedUser;
  }
}

/**
 * Authentication middleware that verifies Cognito JWT tokens.
 * Extracts cognitoUserId from the token and attaches it to the request.
 */
export async function authenticate(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const authHeader = request.headers.authorization;

  if (!authHeader) {
    return reply.status(401).send({
      error: 'Unauthorized',
      message: 'Authorization header is required',
      statusCode: 401,
    });
  }

  const token = authHeader.replace(/^Bearer\s+/i, '');

  if (!token) {
    return reply.status(401).send({
      error: 'Unauthorized',
      message: 'Bearer token is required',
      statusCode: 401,
    });
  }

  try {
    // Verify the JWT token with Cognito
    const payload = await verifier.verify(token);

    // Attach user info to request
    request.user = {
      cognitoUserId: payload.sub,
      email: payload.email as string | undefined,
      username: payload.username as string | undefined,
    };
  } catch (error) {
    request.log.error(error, 'JWT verification failed');
    return reply.status(401).send({
      error: 'Unauthorized',
      message: 'Invalid or expired token',
      statusCode: 401,
    });
  }
}

/**
 * Optional authentication middleware.
 * Does not fail if no token is provided, but validates token if present.
 */
export async function optionalAuthenticate(
  request: FastifyRequest,
  _reply: FastifyReply
): Promise<void> {
  const authHeader = request.headers.authorization;

  if (!authHeader) {
    return;
  }

  const token = authHeader.replace(/^Bearer\s+/i, '');

  if (!token) {
    return;
  }

  try {
    const payload = await verifier.verify(token);
    request.user = {
      cognitoUserId: payload.sub,
      email: payload.email as string | undefined,
      username: payload.username as string | undefined,
    };
  } catch (error) {
    request.log.warn(error, 'Optional JWT verification failed');
    // Don't fail, just continue without user
  }
}

/**
 * Middleware to ensure the authenticated user exists in the database.
 * Must be used after authenticate middleware.
 */
export async function requireUserInDatabase(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  if (!request.user?.cognitoUserId) {
    return reply.status(401).send({
      error: 'Unauthorized',
      message: 'Authentication required',
      statusCode: 401,
    });
  }

  const userService = new UserService();
  const user = await userService.findByCognitoId(request.user.cognitoUserId);

  if (!user) {
    return reply.status(404).send({
      error: 'Not Found',
      message: 'User not found in database',
      statusCode: 404,
    });
  }
}
