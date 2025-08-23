const redisService = require('../../../src/services/redisService');

// Mock do Redis
jest.mock('ioredis', () => {
  const mockClient = {
    on: jest.fn(),
    connect: jest.fn(),
    quit: jest.fn(),
    get: jest.fn(),
    setex: jest.fn(),
    del: jest.fn(),
    flushdb: jest.fn(),
    incrby: jest.fn(),
    expire: jest.fn(),
    pipeline: jest.fn(() => ({
      zremrangebyscore: jest.fn().mockReturnThis(),
      zcard: jest.fn().mockReturnThis(),
      zadd: jest.fn().mockReturnThis(),
      expire: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([
        [null, 1], // zremrangebyscore
        [null, 5], // zcard
        [null, 1], // zadd
        [null, 1]  // expire
      ])
    }))
  };
  
  return jest.fn(() => mockClient);
});

describe('RedisService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    redisService.client = null;
    redisService.isConnected = false;
  });

  describe('connect', () => {
    it('deve conectar com sucesso', async () => {
      const mockClient = {
        on: jest.fn(),
        connect: jest.fn().mockResolvedValue(),
        quit: jest.fn()
      };
      
      const Redis = require('ioredis');
      Redis.mockImplementation(() => mockClient);

      const result = await redisService.connect();
      
      expect(result).toBe(true);
      expect(redisService.isConnected).toBe(true);
      expect(mockClient.on).toHaveBeenCalledWith('connect', expect.any(Function));
      expect(mockClient.on).toHaveBeenCalledWith('error', expect.any(Function));
      expect(mockClient.on).toHaveBeenCalledWith('close', expect.any(Function));
    });

    it('deve falhar na conexão', async () => {
      const mockClient = {
        on: jest.fn(),
        connect: jest.fn().mockRejectedValue(new Error('Connection failed')),
        quit: jest.fn()
      };
      
      const Redis = require('ioredis');
      Redis.mockImplementation(() => mockClient);

      const result = await redisService.connect();
      
      expect(result).toBe(false);
      expect(redisService.isConnected).toBe(false);
    });
  });

  describe('checkRateLimit', () => {
    it('deve retornar fallback quando Redis não está disponível', async () => {
      const result = await redisService.checkRateLimit('test-key', 100, 60000);
      
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(100);
      expect(result.resetTime).toBeGreaterThan(Date.now());
    });

    it('deve verificar rate limit com Redis', async () => {
      redisService.isConnected = true;
      redisService.client = {
        pipeline: jest.fn(() => ({
          zremrangebyscore: jest.fn().mockReturnThis(),
          zcard: jest.fn().mockReturnThis(),
          zadd: jest.fn().mockReturnThis(),
          expire: jest.fn().mockReturnThis(),
          exec: jest.fn().mockResolvedValue([
            [null, 1], // zremrangebyscore
            [null, 5], // zcard
            [null, 1], // zadd
            [null, 1]  // expire
          ])
        }))
      };

      const result = await redisService.checkRateLimit('test-key', 100, 60000);
      
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(95);
      expect(result.currentCount).toBe(5);
    });
  });

  describe('cache operations', () => {
    beforeEach(() => {
      redisService.isConnected = true;
      redisService.client = {
        get: jest.fn(),
        setex: jest.fn(),
        del: jest.fn(),
        flushdb: jest.fn()
      };
    });

    it('deve retornar null quando Redis não está disponível', async () => {
      redisService.isConnected = false;
      
      const result = await redisService.get('test-key');
      
      expect(result).toBeNull();
    });

    it('deve buscar valor do cache', async () => {
      const mockValue = JSON.stringify({ test: 'data' });
      redisService.client.get.mockResolvedValue(mockValue);
      
      const result = await redisService.get('test-key');
      
      expect(result).toEqual({ test: 'data' });
      expect(redisService.client.get).toHaveBeenCalledWith('test-key');
    });

    it('deve definir valor no cache', async () => {
      redisService.client.setex.mockResolvedValue('OK');
      
      const result = await redisService.set('test-key', { test: 'data' }, 300);
      
      expect(result).toBe(true);
      expect(redisService.client.setex).toHaveBeenCalledWith('test-key', 300, expect.any(String));
    });

    it('deve deletar valor do cache', async () => {
      redisService.client.del.mockResolvedValue(1);
      
      const result = await redisService.del('test-key');
      
      expect(result).toBe(true);
      expect(redisService.client.del).toHaveBeenCalledWith('test-key');
    });
  });

  describe('metrics', () => {
    beforeEach(() => {
      redisService.isConnected = true;
      redisService.client = {
        incrby: jest.fn(),
        expire: jest.fn(),
        get: jest.fn()
      };
    });

    it('deve incrementar métrica', async () => {
      redisService.client.incrby.mockResolvedValue(5);
      redisService.client.expire.mockResolvedValue(1);
      
      const result = await redisService.incrementMetric('test_metric', 3);
      
      expect(result).toBe(true);
      expect(redisService.client.incrby).toHaveBeenCalled();
      expect(redisService.client.expire).toHaveBeenCalledWith(expect.any(String), 86400);
    });

    it('deve obter métrica', async () => {
      redisService.client.get.mockResolvedValue('42');
      
      const result = await redisService.getMetric('test_metric');
      
      expect(result).toBe(42);
      expect(redisService.client.get).toHaveBeenCalled();
    });
  });
});

