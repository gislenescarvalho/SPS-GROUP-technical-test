const request = require('supertest');
const express = require('express');
const errorHandler = require('../../../src/middleware/errorHandler');

// Mock do logger para testes
jest.mock('../../../src/utils/logger', () => ({
  errorWithContext: jest.fn()
}));

describe('Error Handler Middleware', () => {
  let app;

  beforeEach(() => {
    app = express();
  });

  describe('Mensagens de Erro Consistentes', () => {
    it('deve retornar erro 400 para campos obrigatórios', () => {
      app.get('/test', (req, res, next) => {
        const error = new Error('Email e senha são obrigatórios');
        next(error);
      });
      app.use(errorHandler);

      return request(app)
        .get('/test')
        .expect(400)
        .then(response => {
          expect(response.body.error).toBe('Email e senha são obrigatórios');
          expect(response.body).toHaveProperty('timestamp');
          expect(response.body).toHaveProperty('path');
        });
    });

    it('deve retornar erro 401 para credenciais inválidas', () => {
      app.get('/test', (req, res, next) => {
        const error = new Error('Credenciais inválidas');
        next(error);
      });
      app.use(errorHandler);

      return request(app)
        .get('/test')
        .expect(401)
        .then(response => {
          expect(response.body.error).toBe('Credenciais inválidas');
          expect(response.body).toHaveProperty('timestamp');
          expect(response.body).toHaveProperty('path');
        });
    });

    it('deve retornar erro 404 para usuário não encontrado', () => {
      app.get('/test', (req, res, next) => {
        const error = new Error('Usuário não encontrado');
        next(error);
      });
      app.use(errorHandler);

      return request(app)
        .get('/test')
        .expect(404)
        .then(response => {
          expect(response.body.error).toBe('Usuário não encontrado');
          expect(response.body).toHaveProperty('timestamp');
          expect(response.body).toHaveProperty('path');
        });
    });

    it('deve retornar erro 400 para email já cadastrado', () => {
      app.get('/test', (req, res, next) => {
        const error = new Error('Email já cadastrado');
        next(error);
      });
      app.use(errorHandler);

      return request(app)
        .get('/test')
        .expect(400)
        .then(response => {
          expect(response.body.error).toBe('Email já cadastrado');
          expect(response.body).toHaveProperty('timestamp');
          expect(response.body).toHaveProperty('path');
        });
    });

    it('deve retornar erro 403 para tentativa de deletar admin', () => {
      app.get('/test', (req, res, next) => {
        const error = new Error('Não é possível deletar o usuário admin principal');
        next(error);
      });
      app.use(errorHandler);

      return request(app)
        .get('/test')
        .expect(403)
        .then(response => {
          expect(response.body.error).toBe('Não é possível deletar o usuário admin principal');
          expect(response.body).toHaveProperty('timestamp');
          expect(response.body).toHaveProperty('path');
        });
    });

    it('deve retornar erro 403 para CORS', () => {
      app.get('/test', (req, res, next) => {
        const error = new Error('Não permitido pelo CORS');
        next(error);
      });
      app.use(errorHandler);

      return request(app)
        .get('/test')
        .expect(403)
        .then(response => {
          expect(response.body.error).toBe('Origem não permitida');
          expect(response.body).toHaveProperty('timestamp');
          expect(response.body).toHaveProperty('path');
        });
    });

    it('deve retornar erro 500 para erros internos', () => {
      app.get('/test', (req, res, next) => {
        const error = new Error('Erro interno qualquer');
        next(error);
      });
      app.use(errorHandler);

      return request(app)
        .get('/test')
        .expect(500)
        .then(response => {
          expect(response.body.error).toBe('Erro interno do servidor');
          expect(response.body).toHaveProperty('timestamp');
          expect(response.body).toHaveProperty('path');
        });
    });

    it('deve incluir stack trace em desenvolvimento', () => {
      process.env.NODE_ENV = 'development';
      
      app.get('/test', (req, res, next) => {
        const error = new Error('Erro de teste');
        next(error);
      });
      app.use(errorHandler);

      return request(app)
        .get('/test')
        .expect(500)
        .then(response => {
          expect(response.body.error).toBe('Erro interno do servidor');
          expect(response.body).toHaveProperty('stack');
          expect(response.body.stack).toContain('Error: Erro de teste');
        })
        .finally(() => {
          process.env.NODE_ENV = 'test';
        });
    });

    it('deve respeitar status code customizado', () => {
      app.get('/test', (req, res, next) => {
        const error = new Error('Erro customizado');
        error.status = 422;
        next(error);
      });
      app.use(errorHandler);

      return request(app)
        .get('/test')
        .expect(422)
        .then(response => {
          expect(response.body.error).toBe('Erro customizado');
          expect(response.body).toHaveProperty('timestamp');
          expect(response.body).toHaveProperty('path');
        });
    });
  });

  describe('Logging de Erros', () => {
    it('deve logar erros estruturados', () => {
      const logger = require('../../../src/utils/logger');
      
      // Limpar mocks antes do teste
      logger.errorWithContext.mockClear();
      
      app.get('/test', (req, res, next) => {
        const error = new Error('Erro de teste');
        next(error);
      });
      app.use(errorHandler);

      return request(app)
        .get('/test')
        .expect(500)
        .then(() => {
          expect(logger.errorWithContext).toHaveBeenCalled();
          const logCall = logger.errorWithContext.mock.calls[0];
          expect(logCall[0].message).toBe('Erro de teste');
        });
    });
  });
});
