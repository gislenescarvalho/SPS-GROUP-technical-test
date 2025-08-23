const request = require('supertest');
const express = require('express');
const { validate, validateId } = require('../../../src/middleware/validation');
const { createUserSchema } = require('../../../src/validations/schemas');
const errorHandler = require('../../../src/middleware/errorHandler');

describe('Validation Middleware', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
  });

  describe('validate() - Generic Validation', () => {
    it('deve aceitar dados válidos', () => {
      const middleware = validate(createUserSchema);
      
      app.post('/test', middleware, (req, res) => {
        res.json(req.body);
      });

      const validData = {
        name: 'Test User',
        email: 'test@test.com',
        type: 'user',
        password: 'Test123!@#'
      };

      return request(app)
        .post('/test')
        .send(validData)
        .expect(200)
        .then(response => {
          expect(response.body).toEqual(validData);
        });
    });

    it('deve rejeitar dados inválidos', () => {
      const middleware = validate(createUserSchema);
      
      app.post('/test', middleware, (req, res) => {
        res.json(req.body);
      });
      app.use(errorHandler);

      const invalidData = {
        name: 'Test User',
        email: 'invalid-email',
        type: 'user',
        password: 'weak'
      };

      return request(app)
        .post('/test')
        .send(invalidData)
        .expect(400)
        .then(response => {
          expect(response.body.error).toContain('Múltiplos erros de validação');
          expect(response.body.error).toContain('Formato de email inválido');
          expect(response.body.error).toContain('Senha deve ter pelo menos 8 caracteres');
        });
    });

    it('deve rejeitar campos obrigatórios faltando', () => {
      const middleware = validate(createUserSchema);
      
      app.post('/test', middleware, (req, res) => {
        res.json(req.body);
      });
      app.use(errorHandler);

      const incompleteData = {
        name: 'Test User',
        email: 'test@test.com'
        // password e type faltando
      };

      return request(app)
        .post('/test')
        .send(incompleteData)
        .expect(400)
        .then(response => {
          expect(response.body.error).toContain('Múltiplos erros de validação');
          expect(response.body.error).toContain('Tipo é obrigatório');
          expect(response.body.error).toContain('Senha é obrigatória');
        });
    });

    it('deve rejeitar campos desconhecidos', () => {
      const middleware = validate(createUserSchema);
      
      app.post('/test', middleware, (req, res) => {
        res.json(req.body);
      });
      app.use(errorHandler);

      const dataWithExtra = {
        name: 'Test User',
        email: 'test@test.com',
        type: 'user',
        password: 'Test123!@#',
        extraField: 'should be rejected'
      };

      return request(app)
        .post('/test')
        .send(dataWithExtra)
        .expect(400)
        .then(response => {
          expect(response.body.error).toContain('"extraField" is not allowed');
        });
    });
  });

  describe('validateId()', () => {
    it('deve aceitar ID válido', () => {
      app.get('/test/:id', validateId, (req, res) => {
        res.json({ id: req.params.id });
      });

      return request(app)
        .get('/test/123')
        .expect(200)
        .then(response => {
          expect(response.body.id).toBe('123');
        });
    });

    it('deve rejeitar ID não numérico', () => {
      app.get('/test/:id', validateId, (req, res) => {
        res.json({ id: req.params.id });
      });
      app.use(errorHandler);

      return request(app)
        .get('/test/abc')
        .expect(400)
        .then(response => {
          expect(response.body.error).toBe('ID deve ser um número');
        });
    });

    it('deve rejeitar ID vazio', () => {
      app.get('/test/:id', validateId, (req, res) => {
        res.json({ id: req.params.id });
      });
      app.use(errorHandler);
      
      // Adicionar middleware de 404 para testes
      app.use('*', (req, res) => {
        res.status(404).json({
          error: 'Endpoint não encontrado',
          timestamp: new Date().toISOString(),
          path: req.originalUrl
        });
      });

      return request(app)
        .get('/test/')
        .expect(404) // Express retorna 404 para rotas não encontradas
        .then(response => {
          expect(response.body.error).toBe('Endpoint não encontrado');
        });
    });

    it('deve rejeitar ID ausente', () => {
      app.get('/test/:id', validateId, (req, res) => {
        res.json({ id: req.params.id });
      });
      app.use(errorHandler);
      
      // Adicionar middleware de 404 para testes
      app.use('*', (req, res) => {
        res.status(404).json({
          error: 'Endpoint não encontrado',
          timestamp: new Date().toISOString(),
          path: req.originalUrl
        });
      });

      return request(app)
        .get('/test/')
        .expect(404) // Express retorna 404 para rotas não encontradas
        .then(response => {
          expect(response.body.error).toBe('Endpoint não encontrado');
        });
    });
  });
});
