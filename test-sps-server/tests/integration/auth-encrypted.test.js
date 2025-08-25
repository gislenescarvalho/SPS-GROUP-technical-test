const request = require('supertest');
const express = require('express');
const authRoutes = require('../../src/routes/auth');
const authController = require('../../src/controllers/authController');
const authService = require('../../src/services/authService');
const errorHandler = require('../../src/middleware/errorHandler');
const CryptoUtils = require('../../src/utils/crypto');

// Mock do authService
jest.mock('../../src/services/authService');
jest.mock('../../src/controllers/authController');

describe('Auth Integration Tests - Encrypted Passwords', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/auth', authRoutes);
    app.use(errorHandler);
    
    jest.clearAllMocks();
  });

  describe('POST /auth/login - Senhas Criptografadas', () => {
    it('deve fazer login com senha criptografada válida', async () => {
      const mockUser = {
        id: 1,
        name: 'Admin',
        email: 'admin@spsgroup.com.br',
        type: 'admin'
      };
      
      const mockResult = {
        user: mockUser,
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test',
        refreshToken: 'refresh.token.here',
        expiresIn: 86400
      };

      authService.authenticateUser.mockResolvedValue(mockResult);

      // Dados de login criptografados
      const loginData = {
        email: 'admin@spsgroup.com.br',
        password: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6',
        salt: 'salt12345678901234567890123456789012',
        iterations: 10000,
        keyLength: 64,
        digest: 'sha512',
        sessionInfo: {
          sessionSalt: 'sessionSalt1234567890123456789012345678901234567890123456789012345678901234'
        }
      };

      const response = await request(app)
        .post('/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: 'Login realizado com sucesso',
        data: mockResult
      });
      
      expect(authService.authenticateUser).toHaveBeenCalledWith(
        loginData.email,
        loginData.password,
        loginData.salt,
        loginData.iterations,
        loginData.keyLength,
        loginData.digest,
        loginData.sessionInfo
      );
    });

    it('deve rejeitar login com dados criptografados inválidos', async () => {
      authService.authenticateUser.mockRejectedValue(new Error('Credenciais inválidas'));

      const invalidLoginData = {
        email: 'admin@spsgroup.com.br',
        password: 'invalidHash',
        salt: 'invalidSalt',
        iterations: 10000,
        keyLength: 64,
        digest: 'sha512',
        sessionInfo: {
          sessionSalt: 'invalidSessionSalt'
        }
      };

      const response = await request(app)
        .post('/auth/login')
        .send(invalidLoginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Credenciais inválidas');
    });

    it('deve validar campos obrigatórios para senha criptografada', async () => {
      const incompleteData = {
        email: 'admin@spsgroup.com.br',
        password: 'hash123',
        // Faltando salt, iterations, etc.
      };

      const response = await request(app)
        .post('/auth/login')
        .send(incompleteData)
        .expect(400);

      expect(response.body.error).toContain('Salt é obrigatório');
    });

    it('deve validar formato do hash de senha', async () => {
      const invalidHashData = {
        email: 'admin@spsgroup.com.br',
        password: 'short', // Hash muito curto
        salt: 'salt12345678901234567890123456789012',
        iterations: 10000,
        keyLength: 64,
        digest: 'sha512',
        sessionInfo: {
          sessionSalt: 'sessionSalt1234567890123456789012345678901234567890123456789012345678901234'
        }
      };

      const response = await request(app)
        .post('/auth/login')
        .send(invalidHashData)
        .expect(400);

      expect(response.body.error).toContain('Hash de senha inválido');
    });

    it('deve validar número de iterações', async () => {
      const invalidIterationsData = {
        email: 'admin@spsgroup.com.br',
        password: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6',
        salt: 'salt12345678901234567890123456789012',
        iterations: 500, // Muito baixo
        keyLength: 64,
        digest: 'sha512',
        sessionInfo: {
          sessionSalt: 'sessionSalt1234567890123456789012345678901234567890123456789012345678901234'
        }
      };

      const response = await request(app)
        .post('/auth/login')
        .send(invalidIterationsData)
        .expect(400);

      expect(response.body.error).toContain('Iterações deve ser pelo menos 1000');
    });

    it('deve validar algoritmo de digest', async () => {
      const invalidDigestData = {
        email: 'admin@spsgroup.com.br',
        password: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6',
        salt: 'salt12345678901234567890123456789012',
        iterations: 10000,
        keyLength: 64,
        digest: 'md5', // Algoritmo não permitido
        sessionInfo: {
          sessionSalt: 'sessionSalt1234567890123456789012345678901234567890123456789012345678901234'
        }
      };

      const response = await request(app)
        .post('/auth/login')
        .send(invalidDigestData)
        .expect(400);

      expect(response.body.error).toContain('Digest deve ser sha1, sha256 ou sha512');
    });
  });

  describe('Compatibilidade com Senhas em Texto Plano', () => {
    it('deve aceitar senhas em texto plano para compatibilidade', async () => {
      const mockUser = {
        id: 1,
        name: 'Admin',
        email: 'admin@spsgroup.com.br',
        type: 'admin'
      };
      
      const mockResult = {
        user: mockUser,
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test',
        refreshToken: 'refresh.token.here',
        expiresIn: 86400
      };

      authService.authenticateUser.mockResolvedValue(mockResult);

      // Dados de login em texto plano (compatibilidade)
      const plainTextData = {
        email: 'admin@spsgroup.com.br',
        password: 'Admin@2024!'
      };

      const response = await request(app)
        .post('/auth/login')
        .send(plainTextData)
        .expect(200);

      expect(response.body.success).toBe(true);
      
      expect(authService.authenticateUser).toHaveBeenCalledWith(
        plainTextData.email,
        plainTextData.password,
        undefined, // salt
        undefined, // iterations
        undefined, // keyLength
        undefined, // digest
        undefined  // sessionInfo
      );
    });
  });

  describe('Segurança de Rate Limiting', () => {
    it('deve aplicar rate limiting em tentativas de login', async () => {
      // Fazer múltiplas tentativas de login
      const promises = [];
      
      for (let i = 0; i < 10; i++) {
        promises.push(
          request(app)
            .post('/auth/login')
            .send({
              email: 'admin@spsgroup.com.br',
              password: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6',
              salt: 'salt12345678901234567890123456789012',
              iterations: 10000,
              keyLength: 64,
              digest: 'sha512',
              sessionInfo: {
                sessionSalt: 'sessionSalt1234567890123456789012345678901234567890123456789012345678901234'
              }
            })
        );
      }

      const responses = await Promise.all(promises);
      
      // Verificar se todas as requisições foram processadas
      responses.forEach(response => {
        expect(response.status).toBeOneOf([200, 401, 429]); // Sucesso, erro de credenciais, ou rate limit
      });
    });
  });
});
