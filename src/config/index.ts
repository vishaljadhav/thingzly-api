import { z } from 'zod';

const envSchema = z.object({
  PORT: z.string().default('3000').transform(Number),
  HOST: z.string().default('0.0.0.0'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  API_PREFIX: z.string().default('/api/v1'),
  CORS_ORIGIN: z.string().default('*'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  // AWS Cognito configuration
  AWS_COGNITO_USER_POOL_ID: z.string().min(1, 'AWS_COGNITO_USER_POOL_ID is required'),
  AWS_COGNITO_CLIENT_ID: z.string().min(1, 'AWS_COGNITO_CLIENT_ID is required'),
  AWS_COGNITO_REGION: z.string().default('us-east-1'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:');
  console.error(parsed.error.format());
  process.exit(1);
}

export const config = {
  port: parsed.data.PORT,
  host: parsed.data.HOST,
  nodeEnv: parsed.data.NODE_ENV,
  databaseUrl: parsed.data.DATABASE_URL,
  apiPrefix: parsed.data.API_PREFIX,
  corsOrigin: parsed.data.CORS_ORIGIN,
  logLevel: parsed.data.LOG_LEVEL,
  isDev: parsed.data.NODE_ENV === 'development',
  isProd: parsed.data.NODE_ENV === 'production',
  isTest: parsed.data.NODE_ENV === 'test',
  // AWS Cognito
  cognito: {
    userPoolId: parsed.data.AWS_COGNITO_USER_POOL_ID,
    clientId: parsed.data.AWS_COGNITO_CLIENT_ID,
    region: parsed.data.AWS_COGNITO_REGION,
  },
} as const;

export type Config = typeof config;
