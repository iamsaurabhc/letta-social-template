import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';

const logger = new Logger('Bootstrap');
let app;

async function bootstrap() {
  try {
    if (!app) {
      app = await NestFactory.create(AppModule);
      
      app.useGlobalPipes(new ValidationPipe());
      app.setGlobalPrefix('api');
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
    }
    return app;
  } catch (error) {
    logger.error('Failed to initialize NestJS application:', error);
    throw error;
  }
}

// Vercel serverless handler
export default async function handler(req, res) {
  try {
    if (!app) {
      app = await bootstrap();
    }
    
    const instance = app.getHttpAdapter().getInstance();
    return instance(req, res);
  } catch (error) {
    logger.error('Error in serverless handler:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

// For local development
if (require.main === module) {
  bootstrap().then(app => {
    const port = process.env.PORT || 3001;
    app.listen(port, () => {
      logger.log(`Server listening on port ${port}`);
    });
  }).catch(error => {
    logger.error('Failed to start server:', error);
    process.exit(1);
  });
}