const NodeCache = require('node-cache');
const config = require('../config');

// Cache em memória usando node-cache
const memoryCache = new NodeCache({
  stdTTL: config.cache.defaultTTL,
  checkperiod: 120,
  useClones: false
});

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
};

const cacheMiddleware = () => {
  return async (req, res, next) => {
    if (req.method !== 'GET') {
      return next();
    }

    if (!config.cache.enabled) {
      return next();
    }

    const routeConfig = findCacheConfig(req.path);
    if (!routeConfig || !routeConfig.enabled) {
      return next();
    }

    try {
      const cacheKey = routeConfig.keyPattern(req);
      
      const cached = memoryCache.get(cacheKey);
      if (cached) {
        res.setHeader('X-Cache', 'HIT');
        res.setHeader('X-Cache-Key', cacheKey);
        res.setHeader('X-Cache-TTL', routeConfig.ttl);
        
        return res.json(cached);
      }

      const originalJson = res.json;
      const originalSend = res.send;

      res.json = function(data) {
        res.setHeader('X-Cache', 'MISS');
        res.setHeader('X-Cache-Key', cacheKey);
        res.setHeader('X-Cache-TTL', routeConfig.ttl);

        cacheResponse(cacheKey, data, routeConfig.ttl);

        return originalJson.call(this, data);
      };

      res.send = function(data) {
        res.setHeader('X-Cache', 'MISS');
        res.setHeader('X-Cache-Key', cacheKey);
        res.setHeader('X-Cache-TTL', routeConfig.ttl);

        cacheResponse(cacheKey, data, routeConfig.ttl);

        return originalSend.call(this, data);
      };

      next();
    } catch (error) {
      console.error('❌ Erro no middleware de cache:', error.message);
      next();
    }
  };
};

function findCacheConfig(path) {
  const cleanPath = path.split('?')[0];
  
  if (cacheConfig[cleanPath]) {
    return cacheConfig[cleanPath];
  }
  
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

function cacheResponse(key, data, ttl) {
  try {
    memoryCache.set(key, data, ttl);
  } catch (error) {
    console.error('❌ Erro ao cachear resposta:', error.message);
  }
}

const invalidateCache = (patterns) => {
  return (req, res, next) => {
    try {
      patterns.forEach(pattern => {
        const key = typeof pattern === 'function' ? pattern(req) : pattern;
        memoryCache.del(key);
      });

      console.log('🗑️ Cache invalidado com sucesso');
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
