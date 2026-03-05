import 'dotenv/config';
import { buildApp } from './app.js';
import { config } from './config/index.js';
import { prisma } from './lib/prisma.js';

async function start(): Promise<void> {
  const app = await buildApp();

  // Graceful shutdown
  const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM'];

  signals.forEach((signal) => {
    process.on(signal, async () => {
      await app.close();
      await prisma.$disconnect();
      process.exit(0);
    });
  });

  try {
    // Test database connection
    await prisma.$connect();
    console.info('Database connected successfully');

    // Start server
    await app.listen({
      port: config.port,
      host: config.host,
    });

    console.info(`Server running at http://${config.host}:${config.port}`);
    console.info(`API docs available at http://${config.host}:${config.port}/docs`);
  } catch (error) {
    console.error('Failed to start server:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

start();
