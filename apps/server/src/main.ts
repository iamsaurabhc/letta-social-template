import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
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

// For Vercel serverless functions
export default bootstrap;