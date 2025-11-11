import express, { Express } from 'express';
import cors from 'cors';
import config from './config';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import logger from './utils/logger';

// Import routes
import sessionRoutes from './controllers/session.controller';

export function createApp(): Express {
  const app = express();

  // Middleware
  app.use(cors({
    origin: config.cors.origins,
    credentials: true,
  }));

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Request logging
  app.use((req, _res, next) => {
    logger.info(`${req.method} ${req.path}`, {
      query: req.query,
      ip: req.ip,
    });
    next();
  });

  // Health check
  app.get('/health', (_req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  // API routes
  app.use('/api/sessions', sessionRoutes);

  // Error handling
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
