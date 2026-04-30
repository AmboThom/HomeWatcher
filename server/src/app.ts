import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { rateLimit } from 'express-rate-limit';
import path from 'path';
import { config } from './config';
import { errorHandler, notFound } from './middleware/errorHandler';
import authRouter from './auth/auth.router';
import propertiesRouter from './properties/properties.router';
import invitesRouter from './invites/invites.router';
import tenantRouter from './tenant/tenant.router';
import maintenanceRouter from './maintenance/maintenance.router';
import rentRouter from './rent/rent.router';

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

  // ── Rate limiting ─────────────────────────────────────────
  // Strict limit for auth endpoints (login, register)
  app.use(
    '/api/auth',
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 20,
      standardHeaders: true,
      legacyHeaders: false,
      message: { status: 'error', message: 'Too many requests, please try again later' },
    })
  );

  // General limit for all other API endpoints
  app.use(
    '/api',
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 200,
      standardHeaders: true,
      legacyHeaders: false,
      message: { status: 'error', message: 'Too many requests, please try again later' },
    })
  );

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
  app.use('/api/properties', propertiesRouter);
  app.use('/api/properties/:id/invites', invitesRouter);
  app.use('/api/invites', invitesRouter);
  app.use('/api/tenant', tenantRouter);
  app.use('/api/maintenance', maintenanceRouter);
  app.use('/api/rent', rentRouter);

  // ── Serve client in production ───────────────────────────
  if (config.nodeEnv === 'production') {
    const clientDist = path.join(__dirname, '../../client/dist');
    app.use(express.static(clientDist));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(clientDist, 'index.html'));
    });
  }

  // 404 + global error handler (must be last)
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
