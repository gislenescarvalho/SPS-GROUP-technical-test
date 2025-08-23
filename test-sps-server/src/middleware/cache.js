const redisService = require('../services/redisService');
const config = require('../config');

// Configurações de cache por rota
const cacheConfig = {
  '/api/users': {
    ttl: config.cache.userTTL,
    keyPattern: (req) => `users:list:${req.query.page || 1}:${req.query.limit || 10}`,
    enabled: true
  },
  '/api/users/:id': {
    ttl: config.cache.userTTL,
    keyPattern: (req) => `user:${req.params.id}`,
    enabled: true
  },
  '/api/metrics': {
    ttl: 60, // 1 minuto para métricas
    keyPattern: () => 'metrics:summary',
    enabled: true
  }
};

// Middleware de cache inteligente
const cacheMiddleware = (options = {}) => {
  return async (req, res, next) => {
    // Apenas para requisições GET
    if (req.method !== 'GET') {
      return next();
    }

    // Verificar se cache está habilitado
    if (!config.cache.enabled) {
      return next();
    }

    // Encontrar configuração de cache para a rota
    const routeConfig = findCacheConfig(req.path);
    if (!routeConfig || !routeConfig.enabled) {
      return next();
    }

    try {
      // Gerar chave de cache
      const cacheKey = routeConfig.keyPattern(req);
      
      // Tentar buscar do cache
      const cached = await redisService.get(cacheKey);
      if (cached) {
        // Adicionar header indicando que veio do cache
        res.setHeader('X-Cache', 'HIT');
        res.setHeader('X-Cache-Key', cacheKey);
        res.setHeader('X-Cache-TTL', routeConfig.ttl);
        
        // Registrar métrica de cache hit
        await redisService.incrementMetric('cache_hits');
        
        return res.json(cached);
      }

      // Se não estiver no cache, interceptar a resposta
      const originalJson = res.json;
      const originalSend = res.send;

      res.json = function(data) {
        // Adicionar headers de cache
        res.setHeader('X-Cache', 'MISS');
        res.setHeader('X-Cache-Key', cacheKey);
        res.setHeader('X-Cache-TTL', routeConfig.ttl);

        // Cachear a resposta em background
        cacheResponse(cacheKey, data, routeConfig.ttl)
          .catch(err => console.error('❌ Erro ao cachear resposta:', err.message));

        return originalJson.call(this, data);
      };

      res.send = function(data) {
        // Adicionar headers de cache
        res.setHeader('X-Cache', 'MISS');
        res.setHeader('X-Cache-Key', cacheKey);
        res.setHeader('X-Cache-TTL', routeConfig.ttl);

        // Cachear a resposta em background
        cacheResponse(cacheKey, data, routeConfig.ttl)
          .catch(err => console.error('❌ Erro ao cachear resposta:', err.message));

        return originalSend.call(this, data);
      };

      next();
    } catch (error) {
      console.error('❌ Erro no middleware de cache:', error.message);
      next();
    }
  };
};

// Função para encontrar configuração de cache baseada no path
function findCacheConfig(path) {
  // Remover query parameters
  const cleanPath = path.split('?')[0];
  
  // Verificar match exato primeiro
  if (cacheConfig[cleanPath]) {
    return cacheConfig[cleanPath];
  }
  
  // Verificar padrões com parâmetros
  for (const [pattern, config] of Object.entries(cacheConfig)) {
    if (pattern.includes(':')) {
      const regexPattern = pattern.replace(/:[^/]+/g, '[^/]+');
      const regex = new RegExp(`^${regexPattern}$`);
      if (regex.test(cleanPath)) {
        return config;
      }
    }
  }
  
  return null;
}

// Função para cachear resposta
async function cacheResponse(key, data, ttl) {
  try {
    await redisService.set(key, data, ttl);
    await redisService.incrementMetric('cache_misses');
  } catch (error) {
    console.error('❌ Erro ao cachear resposta:', error.message);
  }
}

// Middleware para invalidar cache
const invalidateCache = (patterns) => {
  return async (req, res, next) => {
    try {
      // Invalidar cache em background
      const invalidationPromises = patterns.map(pattern => {
        if (typeof pattern === 'function') {
          return redisService.del(pattern(req));
        }
        return redisService.del(pattern);
      });

      Promise.all(invalidationPromises)
        .then(() => {
          console.log('🗑️ Cache invalidado com sucesso');
        })
        .catch(err => {
          console.error('❌ Erro ao invalidar cache:', err.message);
        });

      next();
    } catch (error) {
      console.error('❌ Erro no middleware de invalidação:', error.message);
      next();
    }
  };
};

module.exports = {
  cacheMiddleware,
  invalidateCache,
  cacheConfig
};
