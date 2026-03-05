import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';

interface ErrorResponse {
  error: string;
  message: string;
  statusCode: number;
  details?: unknown;
}

export function errorHandler(
  error: FastifyError | ZodError | Error,
  request: FastifyRequest,
  reply: FastifyReply
): void {
  request.log.error(error);

  let response: ErrorResponse;

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    response = {
      error: 'Validation Error',
      message: 'Request validation failed',
      statusCode: 400,
      details: error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    };
    reply.status(400).send(response);
    return;
  }

  // Handle Fastify errors
  if ('statusCode' in error && typeof error.statusCode === 'number') {
    response = {
      error: error.name || 'Error',
      message: error.message,
      statusCode: error.statusCode,
    };
    reply.status(error.statusCode).send(response);
    return;
  }

  // Handle Prisma errors
  if (error.name === 'PrismaClientKnownRequestError') {
    const prismaError = error as { code?: string; meta?: { target?: string[] } };

    if (prismaError.code === 'P2002') {
      response = {
        error: 'Conflict',
        message: `A record with this ${prismaError.meta?.target?.join(', ') || 'field'} already exists`,
        statusCode: 409,
      };
      reply.status(409).send(response);
      return;
    }

    if (prismaError.code === 'P2025') {
      response = {
        error: 'Not Found',
        message: 'Record not found',
        statusCode: 404,
      };
      reply.status(404).send(response);
      return;
    }
  }

  // Default error response
  response = {
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : error.message,
    statusCode: 500,
  };

  reply.status(500).send(response);
}
