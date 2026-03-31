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

export const config = {
  port: parseInt(optionalEnv('PORT', '3001'), 10),
  nodeEnv: optionalEnv('NODE_ENV', 'development'),

  database: {
    url: requireEnv('DATABASE_URL'),
  },

  jwt: {
    accessSecret: requireEnv('JWT_ACCESS_SECRET'),
    refreshSecret: requireEnv('JWT_REFRESH_SECRET'),
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
} as const;
