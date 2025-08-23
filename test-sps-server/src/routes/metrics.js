const express = require('express');
const metricsService = require('../services/metricsService');
const paginationService = require('../utils/pagination');
const config = require('../config');

const router = express.Router();

// Middleware para verificar se métricas estão habilitadas
const checkMetricsEnabled = (req, res, next) => {
  if (!config.metrics.enabled) {
    return res.status(404).json({
      error: 'Métricas não estão habilitadas',
      timestamp: new Date().toISOString()
    });
  }
  next();
};

// GET /api/metrics - Obter métricas gerais
router.get('/', checkMetricsEnabled, async (req, res) => {
  try {
    const metrics = await metricsService.getMetrics();
    
    res.json({
      success: true,
      data: metrics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Erro ao obter métricas:', error.message);
    res.status(500).json({
      error: 'Erro interno ao obter métricas',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/metrics/requests - Métricas de requisições
router.get('/requests', checkMetricsEnabled, async (req, res) => {
  try {
    const metrics = await metricsService.getMetrics();
    
    res.json({
      success: true,
      data: {
        total: metrics.requests.total,
        byMethod: metrics.requests.byMethod,
        byStatus: metrics.requests.byStatus
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Erro ao obter métricas de requisições:', error.message);
    res.status(500).json({
      error: 'Erro interno ao obter métricas de requisições',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/metrics/cache - Métricas de cache
router.get('/cache', checkMetricsEnabled, async (req, res) => {
  try {
    const metrics = await metricsService.getMetrics();
    
    res.json({
      success: true,
      data: {
        hits: metrics.cache.hits,
        misses: metrics.cache.misses,
        hitRate: metrics.cache.hitRate,
        efficiency: `${metrics.cache.hitRate}%`
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Erro ao obter métricas de cache:', error.message);
    res.status(500).json({
      error: 'Erro interno ao obter métricas de cache',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/metrics/performance - Métricas de performance
router.get('/performance', checkMetricsEnabled, async (req, res) => {
  try {
    const metrics = await metricsService.getMetrics();
    
    res.json({
      success: true,
      data: {
        avgResponseTime: `${metrics.performance.avgResponseTime}ms`,
        totalResponseTime: `${metrics.performance.totalResponseTime}ms`,
        requestsPerSecond: metrics.requests.total > 0 ? 
          (metrics.requests.total / (Date.now() / 1000)).toFixed(2) : 0
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Erro ao obter métricas de performance:', error.message);
    res.status(500).json({
      error: 'Erro interno ao obter métricas de performance',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/metrics/errors - Métricas de erros
router.get('/errors', checkMetricsEnabled, async (req, res) => {
  try {
    const metrics = await metricsService.getMetrics();
    
    res.json({
      success: true,
      data: {
        total: metrics.errors.total,
        byStatus: metrics.errors.byStatus,
        errorRate: metrics.requests.total > 0 ? 
          ((metrics.errors.total / metrics.requests.total) * 100).toFixed(2) : 0
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Erro ao obter métricas de erros:', error.message);
    res.status(500).json({
      error: 'Erro interno ao obter métricas de erros',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/metrics/pagination - Métricas de paginação
router.get('/pagination', checkMetricsEnabled, async (req, res) => {
  try {
    const paginationStats = await paginationService.getPaginationStats();
    
    res.json({
      success: true,
      data: {
        queries: paginationStats.queries,
        cacheHits: paginationStats.cacheHits,
        cacheMisses: paginationStats.cacheMisses,
        avgQueryTime: `${paginationStats.avgQueryTime}ms`,
        hitRate: paginationStats.queries > 0 ? 
          ((paginationStats.cacheHits / paginationStats.queries) * 100).toFixed(2) : 0
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Erro ao obter métricas de paginação:', error.message);
    res.status(500).json({
      error: 'Erro interno ao obter métricas de paginação',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/metrics/performance/detailed - Métricas detalhadas de performance
router.get('/performance/detailed', checkMetricsEnabled, async (req, res) => {
  try {
    const metrics = await metricsService.getMetrics();
    const paginationStats = await paginationService.getPaginationStats();
    
    res.json({
      success: true,
      data: {
        responseTime: {
          avg: `${metrics.performance.avgResponseTime}ms`,
          total: `${metrics.performance.totalResponseTime}ms`
        },
        throughput: {
          requestsPerSecond: metrics.requests.total > 0 ? 
            (metrics.requests.total / (Date.now() / 1000)).toFixed(2) : 0,
          totalRequests: metrics.requests.total
        },
        pagination: {
          queries: paginationStats.queries,
          avgQueryTime: `${paginationStats.avgQueryTime}ms`
        },
        cache: {
          hitRate: metrics.cache.hitRate,
          efficiency: `${metrics.cache.hitRate}%`
        }
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Erro ao obter métricas detalhadas:', error.message);
    res.status(500).json({
      error: 'Erro interno ao obter métricas detalhadas',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/metrics/cleanup - Limpar métricas antigas
router.post('/cleanup', checkMetricsEnabled, async (req, res) => {
  try {
    await metricsService.cleanupOldMetrics();
    
    res.json({
      success: true,
      message: 'Limpeza de métricas antigas iniciada',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Erro ao limpar métricas:', error.message);
    res.status(500).json({
      error: 'Erro interno ao limpar métricas',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
