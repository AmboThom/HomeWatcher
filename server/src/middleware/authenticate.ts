import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';

export interface AuthUser {
  id: string;
  email: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ status: 'error', message: 'Unauthorized' });
    return;
  }

  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, config.jwt.accessSecret) as {
      sub: string;
      email: string;
      role: string;
    };
    req.user = { id: payload.sub, email: payload.email, role: payload.role };
    next();
  } catch {
    res.status(401).json({ status: 'error', message: 'Invalid or expired token' });
  }
}
