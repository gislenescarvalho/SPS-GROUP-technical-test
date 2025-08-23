// Configuração específica para testes
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
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // limite por IP
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
  
  redis: {
    host: 'localhost',
    port: 6379,
    password: null,
    db: 1 // Usar DB diferente para testes
  },
  
  cache: {
    enabled: true, // Habilitar cache para testes
    defaultTTL: 60, // 1 minuto para testes
    userTTL: 120, // 2 minutos para testes
    maxSize: 100,
    paginationTTL: 60, // 1 minuto para testes
    metricsTTL: 30 // 30 segundos para testes
  },
  
  metrics: {
    enabled: false, // Desabilitar métricas em testes
    retentionDays: 1
  }
};

module.exports = config;
