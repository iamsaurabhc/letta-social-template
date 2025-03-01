import './path-register';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { GlobalExceptionFilter } from './middleware/error.middleware';
const logger = new Logger('Bootstrap');
let app;

// Optimize bootstrap for faster cold starts
async function bootstrap() {
  if (!app) {
    app = await NestFactory.create(AppModule, {
      logger: process.env.NODE_ENV === 'production' ? ['error', 'warn'] : ['error', 'warn', 'log', 'debug'],
      bufferLogs: true, // Buffer logs for better performance
    });
    
    app.useGlobalPipes(new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }));

    app.useGlobalFilters(new GlobalExceptionFilter());
    app.setGlobalPrefix('api');
    
    // Optimize CORS
    const allowedOrigins = [
      'http://localhost:3000',
      'https://social-auto-agent.vercel.app',
      process.env.NEXT_PUBLIC_CLIENT_URL,
    ].filter(Boolean);

    app.enableCors({
      origin: allowedOrigins,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      credentials: true,
      maxAge: 86400, // Cache CORS preflight for 24 hours
    });

    await app.init();
    logger.log('NestJS application initialized');

    // Start listening if in local development
    if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
      const port = process.env.PORT || 3001;
      await app.listen(port);
      logger.log(`Server listening on port ${port}`);
    }
  }
  return app;
}

// Vercel serverless handler
export default async function handler(req, res) {
  try {
    if (!app) {
      app = await bootstrap();
    }
    
    const instance = app.getHttpAdapter().getInstance();
    await instance(req, res);
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
  bootstrap().catch(error => {
    logger.error('Failed to start server:', error);
    process.exit(1);
  });
}