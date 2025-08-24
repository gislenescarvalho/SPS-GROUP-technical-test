const helmet = require('helmet');
const config = require('../config');
const redisService = require('../services/redisService');

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    if (config.cors.allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Não permitido pelo CORS'));
    }
  },
  credentials: config.cors.credentials,
  methods: config.cors.methods,
  allowedHeaders: config.cors.allowedHeaders,
  exposedHeaders: config.cors.exposedHeaders,
  maxAge: config.cors.maxAge
};

const helmetConfig = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  hidePoweredBy: true
};

const rateLimit = async (req, res, next) => {
  if (!config.rateLimit) {
    console.warn('⚠️ Configuração de rate limit não encontrada, pulando middleware');
    return next();
  }

  const clientIP = req.ip || req.connection.remoteAddress;
  const key = `rate_limit:${clientIP}`;
  
  try {
    const result = await redisService.checkRateLimit(
      key, 
      config.rateLimit.max || 100, 
      config.rateLimit.windowMs || 15 * 60 * 1000
    );
    
    res.setHeader('X-RateLimit-Limit', config.rateLimit.max || 100);
    res.setHeader('X-RateLimit-Remaining', result.remaining);
    res.setHeader('X-RateLimit-Reset', Math.ceil(result.resetTime / 1000));
    
    if (!result.allowed) {
      return res.status(429).json({
        error: config.rateLimit.message?.error || 'Muitas requisições. Tente novamente em alguns minutos.',
        retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
        timestamp: new Date().toISOString()
      });
    }
    
    next();
  } catch (error) {
    console.error('❌ Erro no rate limiting:', error.message);
    next();
  }
};

const removeSensitiveHeaders = (req, res, next) => {
  res.removeHeader('X-Powered-By');
  res.removeHeader('Server');
  
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  next();
};

module.exports = {
  corsOptions,
  helmetConfig,
  rateLimit,
  removeSensitiveHeaders
};
