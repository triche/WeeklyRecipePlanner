import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createMealPlanRouter } from './routes';
import { AIProvider } from './services';

export function createApp(aiProvider: AIProvider): express.Application {
  const app = express();

  // Security middleware
  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: '1mb' }));

  // Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50,
    message: { error: 'Too many requests, please try again later.' },
  });
  app.use('/api/', limiter);

  // Routes
  app.use('/api/meal-plan', createMealPlanRouter(aiProvider));

  // Root health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  return app;
}
