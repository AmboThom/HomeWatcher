import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { config } from './config';
import { errorHandler, notFound } from './middleware/errorHandler';
import authRouter from './auth/auth.router';

export function createApp(): express.Application {
  const app = express();

  // Security headers
  app.use(helmet());

  // CORS
  app.use(
    cors({
      origin: config.cors.clientOrigin,
      credentials: true,
    })
  );

  // Request logging (skip in test)
  if (config.nodeEnv !== 'test') {
    app.use(morgan('dev'));
  }

  // Body parsing
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Cookie parsing (for refresh token)
  app.use(cookieParser());

  // ── Health check ─────────────────────────────────────────
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      environment: config.nodeEnv,
      timestamp: new Date().toISOString(),
    });
  });

  // ── API routes ───────────────────────────────────────────
  app.use('/api/auth', authRouter);

  // 404 + global error handler (must be last)
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
