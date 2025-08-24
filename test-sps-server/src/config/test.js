const config = {
  server: {
    port: 3000,
    env: 'test',
    host: 'localhost'
  },
  
  jwt: {
    secret: 'test-secret-key-for-testing-only',
    expiresIn: '24h',
    refreshExpiresIn: '7d'
  },
  
  cors: {
    allowedOrigins: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:8080'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Content-Length', 'X-Total-Count'],
    maxAge: 86400
  },
  
  rateLimit: {
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
      error: 'Muitas requisições. Tente novamente em alguns minutos.'
    },
    standardHeaders: true,
    legacyHeaders: false
  },
  
  security: {
    bcryptRounds: 12,
    passwordMinLength: 8,
    passwordMaxLength: 128,
    passwordPattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/
  },
  
  logging: {
    level: 'error',
    silent: true
  },
  

  
  cache: {
    enabled: true,
    defaultTTL: 60,
    userTTL: 120,
    maxSize: 100,
    paginationTTL: 60
  }
};

module.exports = config;
