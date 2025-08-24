const isTest = process.env.NODE_ENV === 'test';

const config = isTest ? require('./test') : {
  server: {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development',
    host: process.env.HOST || 'localhost'
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || 'sps-secret-key-development-2024',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
  },
  
  cors: {
    allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || [
      'http://localhost:3001'  // Apenas o frontend React
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type', 
      'Authorization', 
      'X-Requested-With', 
      'X-API-Version', 
      'X-Request-Timestamp'
    ],
    exposedHeaders: ['Content-Length', 'X-Total-Count'],
    maxAge: 600  // 10 minutos
  },
  
  rateLimit: {
    windowMs: 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
    message: {
      error: 'Muitas requisições. Tente novamente em alguns minutos.'
    },
    standardHeaders: true,
    legacyHeaders: false
  },
  
  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 12,
    passwordMinLength: 8,
    passwordMaxLength: 128,
    passwordPattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/
  },
  
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    silent: process.env.NODE_ENV === 'test'
  },
  

  
  cache: {
    enabled: process.env.CACHE_ENABLED !== 'false',
    defaultTTL: parseInt(process.env.CACHE_TTL) || 300,
    userTTL: parseInt(process.env.CACHE_USER_TTL) || 600,
    maxSize: parseInt(process.env.CACHE_MAX_SIZE) || 1000,
    paginationTTL: parseInt(process.env.CACHE_PAGINATION_TTL) || 300
  }
};

if (!isTest) {
  if (!config.jwt.secret) {
    throw new Error('JWT_SECRET environment variable is required');
  }

  if (config.server.env === 'production' && config.jwt.secret === 'sps-secret-key-development-2024') {
    throw new Error('JWT_SECRET cannot be the default value in production');
  }
}

module.exports = config;
