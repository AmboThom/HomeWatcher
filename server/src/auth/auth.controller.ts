import { Request, Response, NextFunction } from 'express';
import { registerSchema, loginSchema } from './auth.schemas';
import {
  registerUser,
  loginUser,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  getUserById,
} from './auth.service';
import { config } from '../config';

const REFRESH_COOKIE = 'refresh_token';

const cookieOptions = {
  httpOnly: true,
  secure: config.nodeEnv === 'production',
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = registerSchema.parse(req.body);
    const user = await registerUser(input);
    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    res.cookie(REFRESH_COOKIE, refreshToken, cookieOptions);
    res.status(201).json({ accessToken, user });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = loginSchema.parse(req.body);
    const user = await loginUser(input);
    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    res.cookie(REFRESH_COOKIE, refreshToken, cookieOptions);
    res.json({ accessToken, user });
  } catch (err) {
    next(err);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const token: string | undefined = req.cookies[REFRESH_COOKIE];
    if (!token) {
      res.status(401).json({ status: 'error', message: 'No refresh token' });
      return;
    }

    const payload = verifyRefreshToken(token);
    const user = await getUserById(payload.sub);
    if (!user) {
      res.status(401).json({ status: 'error', message: 'User not found' });
      return;
    }

    res.json({ accessToken: signAccessToken(user) });
  } catch (err) {
    next(err);
  }
}

export function logout(_req: Request, res: Response): void {
  res.clearCookie(REFRESH_COOKIE);
  res.json({ status: 'ok', message: 'Logged out' });
}
