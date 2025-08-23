const Redis = require('ioredis');
const config = require('../config');

class RedisService {
  constructor() {
    this.client = null;
    this.isConnected = false;
  }

  async connect() {
    try {
      this.client = new Redis({
        host: config.redis.host || 'localhost',
        port: config.redis.port || 6379,
        password: config.redis.password,
        db: config.redis.db || 0,
        retryDelayOnFailover: 100,
        maxRetriesPerRequest: 3,
        lazyConnect: true,
        showFriendlyErrorStack: config.server.env === 'development'
      });

      this.client.on('connect', () => {
        console.log('🔗 Redis conectado');
        this.isConnected = true;
      });

      this.client.on('error', (err) => {
        console.error('❌ Erro no Redis:', err.message);
        this.isConnected = false;
      });

      this.client.on('close', () => {
        console.log('🔌 Redis desconectado');
        this.isConnected = false;
      });

      await this.client.connect();
      return true;
    } catch (error) {
      console.error('❌ Falha ao conectar com Redis:', error.message);
      this.isConnected = false;
      return false;
    }
  }

  async disconnect() {
    if (this.client) {
      await this.client.quit();
      this.client = null;
      this.isConnected = false;
    }
  }

  async isAvailable() {
    return this.isConnected && this.client;
  }

  // Rate Limiting com Redis
  async checkRateLimit(key, limit, windowMs) {
    if (!await this.isAvailable()) {
      return { allowed: true, remaining: limit, resetTime: Date.now() + windowMs };
    }

    const now = Date.now();
    const windowStart = now - windowMs;

    try {
      // Usar pipeline para operações atômicas
      const pipeline = this.client.pipeline();
      
      // Remover entradas antigas
      pipeline.zremrangebyscore(key, 0, windowStart);
      
      // Contar requisições no período
      pipeline.zcard(key);
      
      // Adicionar requisição atual
      pipeline.zadd(key, now, `${now}-${Math.random()}`);
      
      // Definir TTL
      pipeline.expire(key, Math.ceil(windowMs / 1000));

      const results = await pipeline.exec();
      const currentCount = results[1][1];

      const remaining = Math.max(0, limit - currentCount);
      const resetTime = now + windowMs;

      return {
        allowed: currentCount < limit,
        remaining,
        resetTime,
        currentCount
      };
    } catch (error) {
      console.error('❌ Erro no rate limiting:', error.message);
      return { allowed: true, remaining: limit, resetTime: now + windowMs };
    }
  }

  // Cache com Redis
  async get(key) {
    if (!await this.isAvailable()) return null;
    
    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('❌ Erro ao buscar cache:', error.message);
      return null;
    }
  }

  async set(key, value, ttl = 300) { // 5 minutos padrão
    if (!await this.isAvailable()) return false;
    
    try {
      await this.client.setex(key, ttl, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('❌ Erro ao definir cache:', error.message);
      return false;
    }
  }

  async del(key) {
    if (!await this.isAvailable()) return false;
    
    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      console.error('❌ Erro ao deletar cache:', error.message);
      return false;
    }
  }

  async flush() {
    if (!await this.isAvailable()) return false;
    
    try {
      await this.client.flushdb();
      return true;
    } catch (error) {
      console.error('❌ Erro ao limpar cache:', error.message);
      return false;
    }
  }

  // Métricas de performance
  async incrementMetric(metricName, value = 1) {
    if (!await this.isAvailable()) return false;
    
    try {
      const key = `metrics:${metricName}:${new Date().toISOString().split('T')[0]}`;
      await this.client.incrby(key, value);
      await this.client.expire(key, 86400); // 24 horas
      return true;
    } catch (error) {
      console.error('❌ Erro ao incrementar métrica:', error.message);
      return false;
    }
  }

  async getMetric(metricName, date = null) {
    if (!await this.isAvailable()) return 0;
    
    try {
      const targetDate = date || new Date().toISOString().split('T')[0];
      const key = `metrics:${metricName}:${targetDate}`;
      const value = await this.client.get(key);
      return parseInt(value) || 0;
    } catch (error) {
      console.error('❌ Erro ao buscar métrica:', error.message);
      return 0;
    }
  }
}

// Singleton instance
const redisService = new RedisService();

module.exports = redisService;
