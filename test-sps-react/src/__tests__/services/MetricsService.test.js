import MetricsService from '../../services/MetricsService';
import MetricsRepository from '../../repositories/MetricsRepository';

// Mock do repositório
jest.mock('../../repositories/MetricsRepository');

describe('MetricsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getMetrics', () => {
    test('deve obter métricas gerais com sucesso', async () => {
      const mockMetrics = {
        users: { total: 100, active: 80 },
        auth: { totalLogins: 500, failedLogins: 20 },
        performance: { avgResponseTime: 150 }
      };

      MetricsRepository.getAllMetrics.mockResolvedValue(mockMetrics);

      const result = await MetricsService.getMetrics();

      expect(MetricsRepository.getAllMetrics).toHaveBeenCalled();
      expect(result).toEqual(mockMetrics);
    });

    test('deve propagar erro do repositório', async () => {
      const error = new Error('Erro ao obter métricas');
      MetricsRepository.getAllMetrics.mockRejectedValue(error);

      await expect(MetricsService.getMetrics()).rejects.toThrow('Erro ao obter métricas');
    });
  });

  describe('getPerformanceMetrics', () => {
    test('deve obter métricas de performance com sucesso', async () => {
      const mockMetrics = { avgResponseTime: 150, maxResponseTime: 500 };
      MetricsRepository.getPerformanceMetrics.mockResolvedValue(mockMetrics);

      const result = await MetricsService.getPerformanceMetrics();

      expect(MetricsRepository.getPerformanceMetrics).toHaveBeenCalled();
      expect(result).toEqual(mockMetrics);
    });
  });

  describe('getUserMetrics', () => {
    test('deve obter métricas de usuários com sucesso', async () => {
      const mockMetrics = { total: 100, active: 80, newThisMonth: 10 };
      MetricsRepository.getUserMetrics.mockResolvedValue(mockMetrics);

      const result = await MetricsService.getUserMetrics();

      expect(MetricsRepository.getUserMetrics).toHaveBeenCalled();
      expect(result).toEqual(mockMetrics);
    });
  });

  describe('getAuthMetrics', () => {
    test('deve obter métricas de autenticação com sucesso', async () => {
      const mockMetrics = { totalLogins: 500, failedLogins: 20, successRate: 96 };
      MetricsRepository.getAuthMetrics.mockResolvedValue(mockMetrics);

      const result = await MetricsService.getAuthMetrics();

      expect(MetricsRepository.getAuthMetrics).toHaveBeenCalled();
      expect(result).toEqual(mockMetrics);
    });
  });

  describe('getCacheMetrics', () => {
    test('deve obter métricas de cache com sucesso', async () => {
      const mockMetrics = { hitRate: 85, missRate: 15, totalRequests: 1000 };
      MetricsRepository.getCacheMetrics.mockResolvedValue(mockMetrics);

      const result = await MetricsService.getCacheMetrics();

      expect(MetricsRepository.getCacheMetrics).toHaveBeenCalled();
      expect(result).toEqual(mockMetrics);
    });
  });

  describe('getErrorMetrics', () => {
    test('deve obter métricas de erro com sucesso', async () => {
      const mockMetrics = { rate: 2.5, totalErrors: 25, mostCommon: '404' };
      MetricsRepository.getErrorMetrics.mockResolvedValue(mockMetrics);

      const result = await MetricsService.getErrorMetrics();

      expect(MetricsRepository.getErrorMetrics).toHaveBeenCalled();
      expect(result).toEqual(mockMetrics);
    });
  });

  describe('getMetricsByPeriod', () => {
    test('deve obter métricas por período com sucesso', async () => {
      const startDate = '2024-01-01';
      const endDate = '2024-01-31';
      const mockMetrics = { period: '2024-01', data: [] };

      MetricsRepository.getMetricsByPeriod.mockResolvedValue(mockMetrics);

      const result = await MetricsService.getMetricsByPeriod(startDate, endDate);

      expect(MetricsRepository.getMetricsByPeriod).toHaveBeenCalledWith(startDate, endDate);
      expect(result).toEqual(mockMetrics);
    });

    test('deve validar período inválido', async () => {
      const startDate = '2024-02-01';
      const endDate = '2024-01-01'; // Data inicial maior que final

      await expect(MetricsService.getMetricsByPeriod(startDate, endDate)).rejects.toThrow('Data inicial não pode ser maior que a data final');
      expect(MetricsRepository.getMetricsByPeriod).not.toHaveBeenCalled();
    });

    test('deve aceitar período válido', async () => {
      const startDate = '2024-01-01';
      const endDate = '2024-01-31';
      const mockMetrics = { period: '2024-01', data: [] };

      MetricsRepository.getMetricsByPeriod.mockResolvedValue(mockMetrics);

      const result = await MetricsService.getMetricsByPeriod(startDate, endDate);

      expect(result).toEqual(mockMetrics);
    });
  });

  describe('getMetricsSummary', () => {
    test('deve obter resumo das métricas com sucesso', async () => {
      const mockSummary = {
        totalUsers: 100,
        activeUsers: 80,
        totalLogins: 500,
        failedLogins: 20,
        cacheHitRate: 85,
        errorRate: 2.5,
        avgResponseTime: 150
      };

      MetricsRepository.getMetricsSummary.mockResolvedValue(mockSummary);

      const result = await MetricsService.getMetricsSummary();

      expect(MetricsRepository.getMetricsSummary).toHaveBeenCalled();
      expect(result).toEqual(mockSummary);
    });
  });

  describe('getMetricsByType', () => {
    test('deve obter métricas por tipo válido', async () => {
      const type = 'users';
      const mockMetrics = { total: 100, active: 80 };

      MetricsRepository.getMetricsByType.mockResolvedValue(mockMetrics);

      const result = await MetricsService.getMetricsByType(type);

      expect(MetricsRepository.getMetricsByType).toHaveBeenCalledWith(type);
      expect(result).toEqual(mockMetrics);
    });

    test('deve rejeitar tipo inválido', async () => {
      const invalidType = 'invalid';

      await expect(MetricsService.getMetricsByType(invalidType)).rejects.toThrow('Tipo de métrica inválido');
      expect(MetricsRepository.getMetricsByType).not.toHaveBeenCalled();
    });

    test('deve aceitar todos os tipos válidos', async () => {
      const validTypes = ['users', 'auth', 'performance', 'cache', 'errors'];

      for (const type of validTypes) {
        const mockMetrics = { data: 'test' };
        MetricsRepository.getMetricsByType.mockResolvedValue(mockMetrics);

        const result = await MetricsService.getMetricsByType(type);

        expect(MetricsRepository.getMetricsByType).toHaveBeenCalledWith(type);
        expect(result).toEqual(mockMetrics);
      }
    });
  });

  describe('calculateTrendStats', () => {
    test('deve calcular estatísticas de tendência', async () => {
      const metricType = 'users';
      const days = 7;
      const mockMetrics = { data: [] };

      MetricsRepository.getMetricsByPeriod.mockResolvedValue(mockMetrics);

      const result = await MetricsService.calculateTrendStats(metricType, days);

      expect(MetricsRepository.getMetricsByPeriod).toHaveBeenCalled();
      expect(result).toEqual({
        type: metricType,
        trend: 'stable',
        change: 0,
        period: '7 days'
      });
    });

    test('deve usar período padrão de 7 dias', async () => {
      const metricType = 'users';
      const mockMetrics = { data: [] };

      MetricsRepository.getMetricsByPeriod.mockResolvedValue(mockMetrics);

      await MetricsService.calculateTrendStats(metricType);

      expect(MetricsRepository.getMetricsByPeriod).toHaveBeenCalled();
    });
  });

  describe('analyzeTrends', () => {
    test('deve analisar tendências dos dados', () => {
      const metrics = { data: [] };
      const metricType = 'users';

      const result = MetricsService.analyzeTrends(metrics, metricType);

      expect(result).toEqual({
        type: metricType,
        trend: 'stable',
        change: 0,
        period: '7 days'
      });
    });
  });
});

