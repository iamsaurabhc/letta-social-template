import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as express from 'express';

const server = express();

async function bootstrap() {
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(server)
  );
  
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe());
  
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
  return app;
}

let app: any;

export default async function handler(req: any, res: any) {
  if (!app) {
    app = await bootstrap();
  }
  server(req, res);
}

// For local development
if (require.main === module) {
  bootstrap().then(app => {
    const port = process.env.PORT || 3001;
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  });
}