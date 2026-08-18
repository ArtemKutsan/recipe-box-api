import 'dotenv/config';

// Собираем настройки окружения в одном месте, чтобы остальной код не читал process.env напрямую.
const config = {
  app: {
    port: process.env.PORT || 4000,
    clientOrigin: process.env.CLIENT_ORIGIN || '',
    nodeEnv: process.env.NODE_ENV || 'development',
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET || '',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
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
};

export default config;
