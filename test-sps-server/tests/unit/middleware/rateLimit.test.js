const request = require('supertest');
const express = require('express');
const { rateLimit } = require('../../../src/middleware/security');
const errorHandler = require('../../../src/middleware/errorHandler');

describe('Rate Limiting Middleware', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    
    // Configurar rate limiting
    app.use(rateLimit);
    
    // Rota de teste
    app.post('/test', (req, res) => {
      res.json({ success: true, message: 'Test endpoint' });
    });
    
    app.use(errorHandler);
  });

  describe('Rate Limiting Básico', () => {
    it('deve permitir requisições dentro do limite', async () => {
      const promises = [];
      
      // Fazer 5 requisições (dentro do limite padrão de 100)
      for (let i = 0; i < 5; i++) {
        promises.push(
          request(app)
            .post('/test')
            .send({ data: `test${i}` })
            .expect(200)
        );
      }

      const responses = await Promise.all(promises);
      
      responses.forEach(response => {
        expect(response.body.success).toBe(true);
      });
    });

    it('deve incluir headers de rate limiting', async () => {
      const response = await request(app)
        .post('/test')
        .send({ data: 'test' })
        .expect(200);

      expect(response.headers['x-ratelimit-limit']).toBeDefined();
      expect(response.headers['x-ratelimit-remaining']).toBeDefined();
      expect(response.headers['x-ratelimit-reset']).toBeDefined();
    });
  });

  describe('Bloqueio por Excesso de Requisições', () => {
    it('deve bloquear cliente após exceder limite', async () => {
      const promises = [];
      
      // Fazer 101 requisições (excedendo o limite de 100)
      for (let i = 0; i < 101; i++) {
        promises.push(
          request(app)
            .post('/test')
            .send({ data: `test${i}` })
        );
      }

      const responses = await Promise.all(promises);
      
      // Verificar se pelo menos uma requisição foi bloqueada
      const blockedResponses = responses.filter(r => r.status === 429);
      expect(blockedResponses.length).toBeGreaterThan(0);
      
      if (blockedResponses.length > 0) {
        expect(blockedResponses[0].body.success).toBe(false);
        expect(blockedResponses[0].body.error).toContain('Muitas requisições');
        expect(blockedResponses[0].body.retryAfter).toBeDefined();
      }
    });

    it('deve manter bloqueio por tempo determinado', async () => {
      // Fazer requisições até ser bloqueado
      let response;
      let requestCount = 0;
      
      do {
        response = await request(app)
          .post('/test')
          .send({ data: `test${requestCount}` });
        requestCount++;
      } while (response.status !== 429 && requestCount < 150);

      expect(response.status).toBe(429);
      
      // Tentar fazer outra requisição imediatamente
      const blockedResponse = await request(app)
        .post('/test')
        .send({ data: 'blocked' })
        .expect(429);

      expect(blockedResponse.body.success).toBe(false);
      expect(blockedResponse.body.error).toContain('Muitas requisições');
    });
  });

  describe('Reset de Limite', () => {
    it('deve resetar limite após janela de tempo', async () => {
      // Mock do tempo para simular passagem de tempo
      const originalDateNow = Date.now;
      const mockTime = 1000000;
      Date.now = jest.fn(() => mockTime);

      // Fazer algumas requisições
      for (let i = 0; i < 5; i++) {
        await request(app)
          .post('/test')
          .send({ data: `test${i}` })
          .expect(200);
      }

      // Avançar tempo para além da janela de rate limiting (15 minutos)
      Date.now = jest.fn(() => mockTime + 16 * 60 * 1000);

      // Fazer nova requisição - deve ser permitida
      const response = await request(app)
        .post('/test')
        .send({ data: 'afterReset' })
        .expect(200);

      expect(response.body.success).toBe(true);

      // Restaurar Date.now
      Date.now = originalDateNow;
    });
  });

  describe('Diferentes IPs', () => {
    it('deve tratar cada IP independentemente', async () => {
      const promises = [];
      
      // Simular requisições de IPs diferentes
      for (let i = 0; i < 50; i++) {
        promises.push(
          request(app)
            .post('/test')
            .set('X-Forwarded-For', `192.168.1.${i}`)
            .send({ data: `test${i}` })
            .expect(200)
        );
      }

      const responses = await Promise.all(promises);
      
      responses.forEach(response => {
        expect(response.body.success).toBe(true);
      });
    });
  });

  describe('Configuração de Rate Limiting', () => {
    it('deve usar configuração padrão quando não configurado', async () => {
      // Mock de configuração vazia
      const originalConfig = require('../../../src/config');
      jest.doMock('../../../src/config', () => ({
        rateLimit: {}
      }));

      const response = await request(app)
        .post('/test')
        .send({ data: 'test' })
        .expect(200);

      expect(response.body.success).toBe(true);

      // Restaurar configuração original
      jest.doMock('../../../src/config', () => originalConfig);
    });
  });

  describe('Headers de Rate Limiting', () => {
    it('deve incluir headers corretos', async () => {
      const response = await request(app)
        .post('/test')
        .send({ data: 'test' })
        .expect(200);

      const limit = parseInt(response.headers['x-ratelimit-limit']);
      const remaining = parseInt(response.headers['x-ratelimit-remaining']);
      const reset = parseInt(response.headers['x-ratelimit-reset']);

      expect(limit).toBeGreaterThan(0);
      expect(remaining).toBeGreaterThanOrEqual(0);
      expect(remaining).toBeLessThanOrEqual(limit);
      expect(reset).toBeGreaterThan(0);
    });
  });
});
