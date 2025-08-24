const redisService = require('../services/redisService');
const config = require('../config');

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
    ttl: 60,
    keyPattern: () => 'metrics:summary',
    enabled: true
  }
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
      
      const cached = await redisService.get(cacheKey);
      if (cached) {
        res.setHeader('X-Cache', 'HIT');
        res.setHeader('X-Cache-Key', cacheKey);
        res.setHeader('X-Cache-TTL', routeConfig.ttl);
        
        await redisService.incrementMetric('cache_hits');
        
        return res.json(cached);
      }

      const originalJson = res.json;
      const originalSend = res.send;

      res.json = function(data) {
        res.setHeader('X-Cache', 'MISS');
        res.setHeader('X-Cache-Key', cacheKey);
        res.setHeader('X-Cache-TTL', routeConfig.ttl);

        cacheResponse(cacheKey, data, routeConfig.ttl)
          .catch(err => console.error('❌ Erro ao cachear resposta:', err.message));

        return originalJson.call(this, data);
      };

      res.send = function(data) {
        res.setHeader('X-Cache', 'MISS');
        res.setHeader('X-Cache-Key', cacheKey);
        res.setHeader('X-Cache-TTL', routeConfig.ttl);

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

async function cacheResponse(key, data, ttl) {
  try {
    await redisService.set(key, data, ttl);
    await redisService.incrementMetric('cache_misses');
  } catch (error) {
    console.error('❌ Erro ao cachear resposta:', error.message);
  }
}

const invalidateCache = (patterns) => {
  return async (req, res, next) => {
    try {
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
