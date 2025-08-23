const redisService = require('./redisService');
const config = require('../config');

class MetricsService {
  constructor() {
    this.metrics = {
      requests: 0,
      errors: 0,
      cacheHits: 0,
      cacheMisses: 0,
      responseTimes: []
    };
  }

  // Registrar requisição
  async recordRequest(method, path, statusCode, duration) {
    try {
      // Métricas em memória para performance
      this.metrics.requests++;
      this.metrics.responseTimes.push(duration);
      
      // Manter apenas os últimos 100 tempos de resposta
      if (this.metrics.responseTimes.length > 100) {
        this.metrics.responseTimes.shift();
      }

      // Métricas no Redis para persistência
      await redisService.incrementMetric('requests_total');
      await redisService.incrementMetric(`requests_${method.toLowerCase()}`);
      await redisService.incrementMetric(`requests_${statusCode}`);
      await redisService.incrementMetric('response_time_total', duration);
      
      // Métricas por endpoint
      const endpoint = path.split('?')[0]; // Remover query params
      await redisService.incrementMetric(`endpoint_${endpoint.replace(/\//g, '_')}`);
      
      // Registrar erro se aplicável
      if (statusCode >= 400) {
        await this.recordError(method, path, statusCode);
      }
    } catch (error) {
      console.error('❌ Erro ao registrar métrica de requisição:', error.message);
    }
  }

  // Registrar erro
  async recordError(method, path, statusCode) {
    try {
      this.metrics.errors++;
      await redisService.incrementMetric('errors_total');
      await redisService.incrementMetric(`errors_${statusCode}`);
      
      const endpoint = path.split('?')[0];
      await redisService.incrementMetric(`errors_${endpoint.replace(/\//g, '_')}`);
    } catch (error) {
      console.error('❌ Erro ao registrar métrica de erro:', error.message);
    }
  }

  // Registrar cache hit/miss
  async recordCacheHit() {
    try {
      this.metrics.cacheHits++;
      await redisService.incrementMetric('cache_hits');
    } catch (error) {
      console.error('❌ Erro ao registrar cache hit:', error.message);
    }
  }

  async recordCacheMiss() {
    try {
      this.metrics.cacheMisses++;
      await redisService.incrementMetric('cache_misses');
    } catch (error) {
      console.error('❌ Erro ao registrar cache miss:', error.message);
    }
  }

  // Obter métricas resumidas
  async getMetrics() {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const metrics = {
        requests: {
          total: await redisService.getMetric('requests_total', today),
          byMethod: {
            get: await redisService.getMetric('requests_get', today),
            post: await redisService.getMetric('requests_post', today),
            put: await redisService.getMetric('requests_put', today),
            delete: await redisService.getMetric('requests_delete', today)
          },
          byStatus: {
            '2xx': await redisService.getMetric('requests_200', today) + await redisService.getMetric('requests_201', today),
            '4xx': await redisService.getMetric('requests_400', today) + await redisService.getMetric('requests_401', today) + await redisService.getMetric('requests_404', today),
            '5xx': await redisService.getMetric('requests_500', today)
          }
        },
        errors: {
          total: await redisService.getMetric('errors_total', today),
          byStatus: {
            '400': await redisService.getMetric('errors_400', today),
            '401': await redisService.getMetric('errors_401', today),
            '404': await redisService.getMetric('errors_404', today),
            '500': await redisService.getMetric('errors_500', today)
          }
        },
        cache: {
          hits: await redisService.getMetric('cache_hits', today),
          misses: await redisService.getMetric('cache_misses', today),
          hitRate: this.calculateHitRate()
        },
        performance: {
          avgResponseTime: this.calculateAverageResponseTime(),
          totalResponseTime: await redisService.getMetric('response_time_total', today)
        },
        users: {
          created: await redisService.getMetric('users_created', today),
          updated: await redisService.getMetric('users_updated', today),
          deleted: await redisService.getMetric('users_deleted', today)
        }
      };

      return metrics;
    } catch (error) {
      console.error('❌ Erro ao obter métricas:', error.message);
      return this.getFallbackMetrics();
    }
  }

  // Calcular taxa de cache hit
  calculateHitRate() {
    const total = this.metrics.cacheHits + this.metrics.cacheMisses;
    return total > 0 ? (this.metrics.cacheHits / total * 100).toFixed(2) : 0;
  }

  // Calcular tempo médio de resposta
  calculateAverageResponseTime() {
    if (this.metrics.responseTimes.length === 0) return 0;
    const sum = this.metrics.responseTimes.reduce((a, b) => a + b, 0);
    return (sum / this.metrics.responseTimes.length).toFixed(2);
  }

  // Métricas de fallback (sem Redis)
  getFallbackMetrics() {
    return {
      requests: {
        total: this.metrics.requests,
        byMethod: {},
        byStatus: {}
      },
      errors: {
        total: this.metrics.errors,
        byStatus: {}
      },
      cache: {
        hits: this.metrics.cacheHits,
        misses: this.metrics.cacheMisses,
        hitRate: this.calculateHitRate()
      },
      performance: {
        avgResponseTime: this.calculateAverageResponseTime(),
        totalResponseTime: 0
      },
      users: {
        created: 0,
        updated: 0,
        deleted: 0
      }
    };
  }

  // Limpar métricas antigas
  async cleanupOldMetrics() {
    try {
      if (!await redisService.isAvailable()) return;
      
      const retentionDays = config.metrics.retentionDays;
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
      
      // Implementar limpeza de métricas antigas
      console.log(`🧹 Limpeza de métricas mais antigas que ${retentionDays} dias`);
    } catch (error) {
      console.error('❌ Erro ao limpar métricas antigas:', error.message);
    }
  }
}

// Singleton instance
const metricsService = new MetricsService();

module.exports = metricsService;

