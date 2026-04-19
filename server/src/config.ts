import dotenv from 'dotenv';

dotenv.config();

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function optionalEnv(key: string, fallback: string): string {
  return process.env[key] ?? fallback;
}

function requireMinLength(key: string, value: string, min: number): string {
  if (value.length < min) {
    throw new Error(`Environment variable ${key} must be at least ${min} characters`);
  }
  return value;
}

const nodeEnv = optionalEnv('NODE_ENV', 'development');
const isProduction = nodeEnv === 'production';

// Production-only warnings
if (isProduction) {
  if (!process.env['RESEND_API_KEY']) {
    console.warn('WARNING: RESEND_API_KEY is not set — email notifications will be disabled');
  }
  if (optionalEnv('CLIENT_ORIGIN', 'http://localhost:5173') === 'http://localhost:5173') {
    console.warn('WARNING: CLIENT_ORIGIN is set to localhost — update this for production');
  }
}

export const config = {
  port: parseInt(optionalEnv('PORT', '3001'), 10),
  nodeEnv,

  database: {
    url: requireEnv('DATABASE_URL'),
  },

  jwt: {
    accessSecret: requireMinLength('JWT_ACCESS_SECRET', requireEnv('JWT_ACCESS_SECRET'), 32),
    refreshSecret: requireMinLength('JWT_REFRESH_SECRET', requireEnv('JWT_REFRESH_SECRET'), 32),
    accessExpiresIn: optionalEnv('JWT_ACCESS_EXPIRES_IN', '15m'),
    refreshExpiresIn: optionalEnv('JWT_REFRESH_EXPIRES_IN', '7d'),
  },

  cors: {
    clientOrigin: optionalEnv('CLIENT_ORIGIN', 'http://localhost:5173'),
  },

  aws: {
    region: optionalEnv('AWS_REGION', ''),
    accessKeyId: optionalEnv('AWS_ACCESS_KEY_ID', ''),
    secretAccessKey: optionalEnv('AWS_SECRET_ACCESS_KEY', ''),
    s3BucketName: optionalEnv('S3_BUCKET_NAME', ''),
  },

  email: {
    resendApiKey: optionalEnv('RESEND_API_KEY', ''),
    from: optionalEnv('EMAIL_FROM', 'onboarding@resend.dev'),
  },
} as const;
