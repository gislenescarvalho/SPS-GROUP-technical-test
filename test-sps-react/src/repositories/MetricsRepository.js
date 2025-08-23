import api from '../services/httpInterceptor';
import config from '../config/api';

/**
 * Repositório para operações de métricas
 * Abstrai o acesso aos dados de métricas do sistema
 */
class MetricsRepository {
  constructor() {
    this.baseURL = config.baseURL;
  }

  /**
   * Obter todas as métricas do sistema
   */
  async getAllMetrics() {
    const response = await api.get(config.endpoints.metrics.all);
    return response.data;
  }

  /**
   * Obter métricas específicas
   */
  async getMetricsByType(type) {
    const response = await api.get(`${config.endpoints.metrics.all}/${type}`);
    return response.data;
  }

  /**
   * Obter métricas de usuários
   */
  async getUserMetrics() {
    const response = await api.get(config.endpoints.metrics.users);
    return response.data;
  }

  /**
   * Obter métricas de autenticação
   */
  async getAuthMetrics() {
    const response = await api.get(config.endpoints.metrics.auth);
    return response.data;
  }

  /**
   * Obter métricas de performance
   */
  async getPerformanceMetrics() {
    const response = await api.get(config.endpoints.metrics.performance);
    return response.data;
  }

  /**
   * Obter métricas de cache
   */
  async getCacheMetrics() {
    const response = await api.get(config.endpoints.metrics.cache);
    return response.data;
  }

  /**
   * Obter métricas de erro
   */
  async getErrorMetrics() {
    const response = await api.get(config.endpoints.metrics.errors);
    return response.data;
  }

  /**
   * Obter métricas por período
   */
  async getMetricsByPeriod(startDate, endDate) {
    const queryParams = new URLSearchParams();
    if (startDate) queryParams.append('start', startDate);
    if (endDate) queryParams.append('end', endDate);
    
    const url = `${config.endpoints.metrics.all}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await api.get(url);
    return response.data;
  }

  /**
   * Obter resumo das métricas
   */
  async getMetricsSummary() {
    try {
      const allMetrics = await this.getAllMetrics();
      
      return {
        totalUsers: allMetrics.users?.total || 0,
        activeUsers: allMetrics.users?.active || 0,
        totalLogins: allMetrics.auth?.totalLogins || 0,
        failedLogins: allMetrics.auth?.failedLogins || 0,
        cacheHitRate: allMetrics.cache?.hitRate || 0,
        errorRate: allMetrics.errors?.rate || 0,
        avgResponseTime: allMetrics.performance?.avgResponseTime || 0
      };
    } catch (error) {
      console.error('Erro ao obter resumo das métricas:', error);
      return null;
    }
  }
}

export default new MetricsRepository();

