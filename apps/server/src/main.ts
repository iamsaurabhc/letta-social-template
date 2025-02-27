import './path-register';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { GlobalExceptionFilter } from './middleware/error.middleware';
import { WorkflowService } from './modules/workflow/workflow.service';

const logger = new Logger('Bootstrap');
let app;

async function bootstrap() {
  try {
    if (!app) {
      app = await NestFactory.create(AppModule, {
        logger: ['error', 'warn', 'log', 'debug', 'verbose'],
      });
      
      app.useGlobalPipes(new ValidationPipe({
        transform: true,
        whitelist: true,
      }));
      app.useGlobalFilters(new GlobalExceptionFilter());
      app.setGlobalPrefix('api');
      app.enableCors({
        origin: [
          'http://localhost:3000',
          'https://social-auto-agent.vercel.app',
          process.env.NEXT_PUBLIC_CLIENT_URL,
        ].filter(Boolean),
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
        credentials: true,
        allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'upstash-signature'],
        exposedHeaders: ['Authorization'],
      });

      await app.init();
      logger.log('NestJS application initialized');

      // Only initialize schedules in production environment
      if (process.env.NODE_ENV === 'production') {
        const workflowService = app.get(WorkflowService);
        await workflowService.initializeSchedules()
          .catch(error => {
            logger.error('Failed to initialize schedules:', error);
          });
      }

      // Start listening if in local development
      if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
        const port = process.env.PORT || 3001;
        await app.listen(port);
        logger.log(`Server listening on port ${port}`);
      }
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