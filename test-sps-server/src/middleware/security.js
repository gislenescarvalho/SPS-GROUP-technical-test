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

// Cache para rate limiting
const rateLimitCache = new Map();

const rateLimit = async (req, res, next) => {
  if (!config.rateLimit || !config.rateLimit.max || !config.rateLimit.windowMs) {
    console.warn('⚠️ Configuração de rate limit incompleta, pulando middleware');
    return next();
  }

  const clientId = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  const windowMs = config.rateLimit.windowMs;
  const maxRequests = config.rateLimit.max;

  // Limpar entradas expiradas
  for (const [key, data] of rateLimitCache.entries()) {
    if (now - data.timestamp > windowMs) {
      rateLimitCache.delete(key);
    }
  }

  // Verificar se o cliente existe no cache
  if (!rateLimitCache.has(clientId)) {
    rateLimitCache.set(clientId, {
      count: 1,
      timestamp: now,
      blocked: false,
      blockUntil: 0
    });
  } else {
    const clientData = rateLimitCache.get(clientId);
    
    // Verificar se está bloqueado
    if (clientData.blocked && now < clientData.blockUntil) {
      const remainingTime = Math.ceil((clientData.blockUntil - now) / 1000);
      return res.status(429).json({
        success: false,
        error: `Muitas requisições. Tente novamente em ${remainingTime} segundos.`,
        retryAfter: remainingTime
      });
    }

    // Resetar se a janela de tempo expirou
    if (now - clientData.timestamp > windowMs) {
      clientData.count = 1;
      clientData.timestamp = now;
      clientData.blocked = false;
      clientData.blockUntil = 0;
    } else {
      clientData.count++;
      
      // Bloquear se excedeu o limite
      if (clientData.count > maxRequests) {
        const blockDuration = Math.min(windowMs * 2, 300000); // Máximo 5 minutos
        clientData.blocked = true;
        clientData.blockUntil = now + blockDuration;
        
        return res.status(429).json({
          success: false,
          error: `Muitas requisições. Tente novamente em ${Math.ceil(blockDuration / 1000)} segundos.`,
          retryAfter: Math.ceil(blockDuration / 1000)
        });
      }
    }
  }

  // Adicionar headers de rate limiting
  const currentData = rateLimitCache.get(clientId);
  if (currentData) {
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - currentData.count));
    res.setHeader('X-RateLimit-Reset', Math.ceil((currentData.timestamp + windowMs) / 1000));
  }
  
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
