import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as express from 'express';
import { GlobalExceptionFilter } from './middleware/error.middleware';

const server = express();
const logger = new Logger('Bootstrap');

async function bootstrap() {
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(server)
  );
  
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new GlobalExceptionFilter());
  
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'https://*.vercel.app',
      process.env.NEXT_PUBLIC_CLIENT_URL,
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    exposedHeaders: ['Authorization'],
  });

  await app.init();
  logger.log('NestJS application initialized');
  return app;
}

let app: any;

export default async function handler(req: any, res: any) {
  try {
    if (!app) {
      logger.log('Initializing NestJS application for serverless');
      app = await bootstrap();
      logger.log('NestJS application initialized successfully');
    }
    server(req, res);
  } catch (error) {
    logger.error('Error in serverless handler:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}

// For local development
if (require.main === module) {
  bootstrap().then(app => {
    const port = process.env.PORT || 3001;
    app.listen(port, () => {
      logger.log(`Server running on port ${port}`);
    });
  });
}