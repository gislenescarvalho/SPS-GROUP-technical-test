import MetricsRepository from '../repositories/MetricsRepository';

/**
 * Serviço para operações de métricas
 * Implementa a lógica de negócio usando o repositório
 */
class MetricsService {
  constructor() {
    this.repository = MetricsRepository;
  }

  /**
   * Obter métricas gerais do sistema
   */
  async getMetrics() {
    try {
      return await this.repository.getAllMetrics();
    } catch (error) {
      throw new Error(error.response?.data?.message || "Erro ao obter métricas");
    }
  }

  /**
   * Obter métricas de performance
   */
  async getPerformanceMetrics() {
    try {
      return await this.repository.getPerformanceMetrics();
    } catch (error) {
      throw new Error(error.response?.data?.message || "Erro ao obter métricas de performance");
    }
  }

  /**
   * Obter métricas de usuários
   */
  async getUserMetrics() {
    try {
      return await this.repository.getUserMetrics();
    } catch (error) {
      throw new Error(error.response?.data?.message || "Erro ao obter métricas de usuários");
    }
  }

  /**
   * Obter métricas de autenticação
   */
  async getAuthMetrics() {
    try {
      return await this.repository.getAuthMetrics();
    } catch (error) {
      throw new Error(error.response?.data?.message || "Erro ao obter métricas de autenticação");
    }
  }

  /**
   * Obter métricas de cache
   */
  async getCacheMetrics() {
    try {
      return await this.repository.getCacheMetrics();
    } catch (error) {
      throw new Error(error.response?.data?.message || "Erro ao obter métricas de cache");
    }
  }

  /**
   * Obter métricas de erro
   */
  async getErrorMetrics() {
    try {
      return await this.repository.getErrorMetrics();
    } catch (error) {
      throw new Error(error.response?.data?.message || "Erro ao obter métricas de erro");
    }
  }

  /**
   * Obter métricas por período
   */
  async getMetricsByPeriod(startDate, endDate) {
    try {
      // Validação de negócio
      if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
        throw new Error('Data inicial não pode ser maior que a data final');
      }

      return await this.repository.getMetricsByPeriod(startDate, endDate);
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || "Erro ao obter métricas por período");
    }
  }

  /**
   * Obter resumo das métricas
   */
  async getMetricsSummary() {
    try {
      return await this.repository.getMetricsSummary();
    } catch (error) {
      throw new Error(error.response?.data?.message || "Erro ao obter resumo das métricas");
    }
  }

  /**
   * Obter métricas específicas por tipo
   */
  async getMetricsByType(type) {
    try {
      // Validação de negócio
      const validTypes = ['users', 'auth', 'performance', 'cache', 'errors'];
      if (!validTypes.includes(type)) {
        throw new Error('Tipo de métrica inválido');
      }

      return await this.repository.getMetricsByType(type);
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || "Erro ao obter métricas por tipo");
    }
  }

  /**
   * Calcular estatísticas de tendência
   */
  async calculateTrendStats(metricType, days = 7) {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const metrics = await this.repository.getMetricsByPeriod(
        startDate.toISOString(),
        endDate.toISOString()
      );

      // Lógica de negócio para calcular tendências
      return this.analyzeTrends(metrics, metricType);
    } catch (error) {
      throw new Error(error.response?.data?.message || "Erro ao calcular estatísticas de tendência");
    }
  }

  /**
   * Analisar tendências dos dados
   */
  analyzeTrends(metrics, metricType) {
    // Implementação da lógica de análise de tendências
    // Esta é uma implementação simplificada
    return {
      type: metricType,
      trend: 'stable',
      change: 0,
      period: '7 days'
    };
  }
}

export default new MetricsService();
