import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Add this line to ensure all routes are prefixed with /api
  app.setGlobalPrefix('api');
  
  app.useGlobalPipes(new ValidationPipe());
  
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'https://*.vercel.app',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    exposedHeaders: ['Authorization'],
  });
  
  // For Vercel serverless deployment
  const port = process.env.PORT || 3001;
  await app.listen(port);

  // Required for Vercel
  if (process.env.VERCEL) {
    console.log('Running on Vercel, listening on', port);
  }
}

// Export for serverless
export default bootstrap;

// Also keep this for local development
if (require.main === module) {
  bootstrap();
}