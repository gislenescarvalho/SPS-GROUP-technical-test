const metricsService = require('../services/metricsService');
const config = require('../config');

// Middleware de métricas de performance
const metricsMiddleware = async (req, res, next) => {
  if (!config.metrics.enabled) {
    return next();
  }

  const startTime = Date.now();
  const originalSend = res.send;
  const originalJson = res.json;

  // Interceptar resposta para capturar status code
  res.send = function(data) {
    const duration = Date.now() - startTime;
    const statusCode = res.statusCode;
    
    // Registrar métricas em background
    metricsService.recordRequest(req.method, req.path, statusCode, duration)
      .catch(err => console.error('❌ Erro ao registrar métricas:', err.message));
    
    return originalSend.call(this, data);
  };

  res.json = function(data) {
    const duration = Date.now() - startTime;
    const statusCode = res.statusCode;
    
    // Registrar métricas em background
    metricsService.recordRequest(req.method, req.path, statusCode, duration)
      .catch(err => console.error('❌ Erro ao registrar métricas:', err.message));
    
    return originalJson.call(this, data);
  };

  next();
};

// Middleware para cache metrics
const cacheMetricsMiddleware = async (req, res, next) => {
  if (!config.metrics.enabled) {
    return next();
  }

  const originalJson = res.json;

  res.json = function(data) {
    // Verificar se veio do cache
    const cacheStatus = res.getHeader('X-Cache');
    
    if (cacheStatus === 'HIT') {
      metricsService.recordCacheHit()
        .catch(err => console.error('❌ Erro ao registrar cache hit:', err.message));
    } else if (cacheStatus === 'MISS') {
      metricsService.recordCacheMiss()
        .catch(err => console.error('❌ Erro ao registrar cache miss:', err.message));
    }

    return originalJson.call(this, data);
  };

  next();
};

module.exports = {
  metricsMiddleware,
  cacheMetricsMiddleware
};

