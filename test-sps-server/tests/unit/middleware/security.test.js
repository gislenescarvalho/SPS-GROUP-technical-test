const request = require('supertest');
const express = require('express');

// Mock do config antes de importar o middleware
jest.mock('../../../src/config', () => ({
  cors: {
    allowedOrigins: [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://spsgroup.com.br'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Content-Length', 'X-Total-Count'],
    maxAge: 86400
  }
}));

const { corsOptions, rateLimit, removeSensitiveHeaders } = require('../../../src/middleware/security');


describe('Security Middleware', () => {
  let app;

  beforeEach(() => {
    app = express();
  });

  describe('CORS Configuration', () => {
    it('deve permitir origens válidas', () => {
      const validOrigins = [
        'http://localhost:3000',
        'http://localhost:3001',
        'https://spsgroup.com.br'
      ];

      validOrigins.forEach(origin => {
        const callback = jest.fn();
        corsOptions.origin(origin, callback);
        expect(callback).toHaveBeenCalledWith(null, true);
      });
    });

    it('deve rejeitar origens inválidas', () => {
      const invalidOrigins = [
        'http://malicious-site.com',
        'https://evil-domain.org'
      ];

      invalidOrigins.forEach(origin => {
        const callback = jest.fn();
        corsOptions.origin(origin, callback);
        expect(callback).toHaveBeenCalledWith(new Error('Não permitido pelo CORS'));
      });
    });

    it('deve permitir requisições sem origin', () => {
      const callback = jest.fn();
      corsOptions.origin(null, callback);
      expect(callback).toHaveBeenCalledWith(null, true);
    });

    it('deve ter configurações corretas', () => {
      expect(corsOptions.credentials).toBe(true);
      expect(corsOptions.methods).toContain('GET');
      expect(corsOptions.methods).toContain('POST');
      expect(corsOptions.allowedHeaders).toContain('Authorization');
      expect(corsOptions.maxAge).toBe(86400);
    });
  });

  describe('Rate Limiting', () => {
    it('deve permitir requisições dentro do limite', () => {
      app.use(rateLimit);
      app.get('/test', (req, res) => res.json({ success: true }));

      // Simular requisições
      const promises = [];
      for (let i = 0; i < 50; i++) {
        promises.push(
          request(app)
            .get('/test')
            .set('X-Forwarded-For', '192.168.1.1')
        );
      }

      return Promise.all(promises).then(responses => {
        responses.forEach(response => {
          expect(response.status).not.toBe(429);
        });
      });
    });

    it('deve bloquear requisições excessivas', () => {
      app.use(rateLimit);
      app.get('/test', (req, res) => res.json({ success: true }));

      // Simular muitas requisições para exceder o limite
      const promises = [];
      for (let i = 0; i < 150; i++) {
        promises.push(
          request(app)
            .get('/test')
            .set('X-Forwarded-For', '192.168.1.2')
        );
      }

      return Promise.all(promises).then(responses => {
        const blockedResponses = responses.filter(r => r.status === 429);
        expect(blockedResponses.length).toBeGreaterThan(0);
        
        if (blockedResponses.length > 0) {
          expect(blockedResponses[0].body.error).toContain('Muitas requisições');
          expect(blockedResponses[0].body).toHaveProperty('retryAfter');
        }
      });
    });
  });

  describe('Remove Sensitive Headers', () => {
    it('deve remover headers sensíveis', () => {
      app.use(removeSensitiveHeaders);
      app.get('/test', (req, res) => {
        // Não definir X-Powered-By na rota, deixar o middleware removê-lo
        res.json({ success: true });
      });

      return request(app)
        .get('/test')
        .expect(200)
        .then(response => {
          expect(response.headers['x-powered-by']).toBeUndefined();
          // O header Server pode ainda estar presente pois é definido pelo Node.js
          // O importante é que não seja um valor que exponha informações sensíveis
          if (response.headers['server']) {
            expect(response.headers['server']).not.toContain('Express');
          }
        });
    });

    it('deve adicionar headers de segurança', () => {
      app.use(removeSensitiveHeaders);
      app.get('/test', (req, res) => res.json({ success: true }));

      return request(app)
        .get('/test')
        .expect(200)
        .then(response => {
          expect(response.headers['x-content-type-options']).toBe('nosniff');
          expect(response.headers['x-frame-options']).toBe('DENY');
          expect(response.headers['x-xss-protection']).toBe('1; mode=block');
        });
    });
  });
});
