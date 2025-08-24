const helmet = require('helmet');
const config = require('../config');


const corsOptions = {
  origin: 'http://localhost:3001',  // Apenas o frontend React
  credentials: false, // Desabilitado para reduzir headers
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'], // Headers mínimos
  exposedHeaders: ['Content-Length'],
  maxAge: 600,  // 10 minutos
  optionsSuccessStatus: 200
};

const helmetConfig = {
  contentSecurityPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  hidePoweredBy: true
};

// Cache simples em memória para rate limiting
const rateLimitCache = new Map();

const rateLimit = async (req, res, next) => {
  if (!config.rateLimit || !config.rateLimit.max || !config.rateLimit.windowMs) {
    console.warn('⚠️ Configuração de rate limit incompleta, pulando middleware');
    return next();
  }

  const clientIP = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  const windowMs = config.rateLimit.windowMs || 15 * 60 * 1000;
  const max = config.rateLimit.max || 100;
  
  // Limpar entradas expiradas
  for (const [key, data] of rateLimitCache.entries()) {
    if (now - data.timestamp > windowMs) {
      rateLimitCache.delete(key);
    }
  }
  
  const key = `rate_limit:${clientIP}`;
  const current = rateLimitCache.get(key);
  
  if (!current) {
    rateLimitCache.set(key, {
      count: 1,
      timestamp: now
    });
  } else if (now - current.timestamp > windowMs) {
    rateLimitCache.set(key, {
      count: 1,
      timestamp: now
    });
  } else {
    current.count++;
    if (current.count > max) {
      return res.status(429).json({
        error: config.rateLimit.message?.error || 'Muitas requisições. Tente novamente em alguns minutos.',
        retryAfter: Math.ceil((windowMs - (now - current.timestamp)) / 1000),
        timestamp: new Date().toISOString()
      });
    }
  }
  
  res.setHeader('X-RateLimit-Limit', max);
  res.setHeader('X-RateLimit-Remaining', Math.max(0, max - (current?.count || 1)));
  res.setHeader('X-RateLimit-Reset', Math.ceil((current?.timestamp || now) + windowMs) / 1000);
  
  next();
};

const removeSensitiveHeaders = (req, res, next) => {
  res.removeHeader('X-Powered-By');
  res.removeHeader('Server');
  
  // Headers de segurança mínimos para reduzir tamanho
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Removido headers desnecessários para reduzir tamanho
  // res.setHeader('X-XSS-Protection', '1; mode=block');
  // res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  // res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  // res.setHeader('X-Password-Security', 'strong-validation-enabled');
  
  next();
};

module.exports = {
  corsOptions,
  helmetConfig,
  rateLimit,
  removeSensitiveHeaders
};
