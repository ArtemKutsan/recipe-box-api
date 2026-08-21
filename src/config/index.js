import 'dotenv/config';

// Собираем настройки окружения в одном месте, чтобы остальной код не читал process.env напрямую.
const config = {
  app: {
    port: process.env.PORT || 4000,
    clientOrigin: process.env.CLIENT_ORIGIN || '',
    nodeEnv: process.env.NODE_ENV || 'development',
  },
  auth: {
    sessionCookieName: process.env.SESSION_COOKIE_NAME || 'recipebox_session',
    sessionExpiresIn: process.env.SESSION_EXPIRES_IN || '30d',
    sessionStore: process.env.SESSION_STORE || 'mongo',
    sessionCookieSecure: process.env.SESSION_COOKIE_SECURE === 'true',
    sessionCookieSameSite: process.env.SESSION_COOKIE_SAME_SITE || 'lax',
  },
  db: {
    enabled: process.env.DB_ENABLED === 'true',
    provider: process.env.DB_PROVIDER || 'mongo',
    mongoUri: process.env.MONGODB_URI || '',
  },
  storage: {
    provider: process.env.MEDIA_STORAGE_PROVIDER || 's3',
    awsRegion: process.env.AWS_REGION || '',
    awsS3Bucket: process.env.AWS_S3_BUCKET || '',
  },
};

export default config;
