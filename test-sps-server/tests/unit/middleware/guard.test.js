const jwt = require('jsonwebtoken');

// Mock do config antes de importar o middleware
jest.mock('../../../src/config', () => ({
  jwt: {
    secret: 'test-secret-key',
    expiresIn: '1h'
  }
}));

const { authenticateToken } = require('../../../src/middleware/auth');

describe('Guard/Authentication Middleware', () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    mockReq = {
      headers: {},
      path: '/test'
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    mockNext = jest.fn();
  });

  describe('Token Válido', () => {
    it('deve permitir acesso com token JWT válido', () => {
      const validToken = jwt.sign(
        { id: 1, email: 'admin@spsgroup.com.br', type: 'admin' },
        'test-secret-key',
        { expiresIn: '1h' }
      );

      mockReq.headers.authorization = `Bearer ${validToken}`;

      authenticateToken(mockReq, mockRes, mockNext);

      expect(mockReq.user).toBeDefined();
      expect(mockReq.user.id).toBe(1);
      expect(mockReq.user.email).toBe('admin@spsgroup.com.br');
      expect(mockReq.user.type).toBe('admin');
      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('deve permitir acesso com token de usuário comum', () => {
      const validToken = jwt.sign(
        { id: 2, email: 'user@test.com', type: 'user' },
        'test-secret-key',
        { expiresIn: '1h' }
      );

      mockReq.headers.authorization = `Bearer ${validToken}`;

      authenticateToken(mockReq, mockRes, mockNext);

      expect(mockReq.user).toBeDefined();
      expect(mockReq.user.id).toBe(2);
      expect(mockReq.user.email).toBe('user@test.com');
      expect(mockReq.user.type).toBe('user');
      expect(mockNext).toHaveBeenCalled();
    });

    it('deve preservar todos os dados do token no req.user', () => {
      const tokenPayload = {
        id: 1,
        email: 'admin@spsgroup.com.br',
        type: 'admin',
        customField: 'customValue'
      };

      const validToken = jwt.sign(tokenPayload, 'test-secret-key', { expiresIn: '1h' });
      mockReq.headers.authorization = `Bearer ${validToken}`;

      authenticateToken(mockReq, mockRes, mockNext);

      // Verificar que todos os campos do payload estão presentes
      expect(mockReq.user.id).toBe(tokenPayload.id);
      expect(mockReq.user.email).toBe(tokenPayload.email);
      expect(mockReq.user.type).toBe(tokenPayload.type);
      expect(mockReq.user.customField).toBe(tokenPayload.customField);
      // Verificar que campos JWT padrão estão presentes
      expect(mockReq.user.exp).toBeDefined();
      expect(mockReq.user.iat).toBeDefined();
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('Token Ausente', () => {
    it('deve rejeitar acesso sem Authorization header', () => {
      authenticateToken(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Token de acesso necessário',
        timestamp: expect.any(String),
        path: '/test'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('deve rejeitar acesso com Authorization header vazio', () => {
      mockReq.headers.authorization = '';

      authenticateToken(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Token de acesso necessário',
        timestamp: expect.any(String),
        path: '/test'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('deve rejeitar acesso com Authorization header sem Bearer', () => {
      mockReq.headers.authorization = 'invalid-token';

      authenticateToken(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Token de acesso necessário',
        timestamp: expect.any(String),
        path: '/test'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('Token Inválido', () => {
    it('deve rejeitar acesso com token inválido', () => {
      mockReq.headers.authorization = 'Bearer invalid-token';

      authenticateToken(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Token inválido ou expirado',
        timestamp: expect.any(String),
        path: '/test'
      });
    });

    it('deve rejeitar acesso com token expirado', () => {
      const expiredToken = jwt.sign(
        { id: 1, email: 'admin@spsgroup.com.br', type: 'admin' },
        'test-secret-key',
        { expiresIn: '0s' }
      );

      mockReq.headers.authorization = `Bearer ${expiredToken}`;

      authenticateToken(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Token inválido ou expirado',
        timestamp: expect.any(String),
        path: '/test'
      });
    });

    it('deve rejeitar acesso com token JWT malformado', () => {
      mockReq.headers.authorization = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid';

      authenticateToken(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Token inválido ou expirado',
        timestamp: expect.any(String),
        path: '/test'
      });
    });
  });

  describe('Cenários de Borda', () => {
    it('deve aceitar token com espaços extras', () => {
      const validToken = jwt.sign(
        { id: 1, email: 'admin@spsgroup.com.br', type: 'admin' },
        'test-secret-key',
        { expiresIn: '1h' }
      );

      mockReq.headers.authorization = `  Bearer  ${validToken}  `;

      authenticateToken(mockReq, mockRes, mockNext);

      expect(mockReq.user).toBeDefined();
      expect(mockNext).toHaveBeenCalled();
    });

    it('deve aceitar token com case diferente', () => {
      const validToken = jwt.sign(
        { id: 1, email: 'admin@spsgroup.com.br', type: 'admin' },
        'test-secret-key',
        { expiresIn: '1h' }
      );

      mockReq.headers.authorization = `bearer ${validToken}`;

      authenticateToken(mockReq, mockRes, mockNext);

      expect(mockReq.user).toBeDefined();
      expect(mockNext).toHaveBeenCalled();
    });

    it('deve rejeitar token com formato Bearer inválido', () => {
      const validToken = jwt.sign(
        { id: 1, email: 'admin@spsgroup.com.br', type: 'admin' },
        'test-secret-key',
        { expiresIn: '1h' }
      );

      mockReq.headers.authorization = `BearerToken ${validToken}`;

      authenticateToken(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Token de acesso necessário',
        timestamp: expect.any(String),
        path: '/test'
      });
    });
  });

  describe('Logging e Debugging', () => {
    it('deve incluir timestamp na resposta de erro', () => {
      authenticateToken(mockReq, mockRes, mockNext);

      const responseCall = mockRes.json.mock.calls[0][0];
      expect(responseCall.timestamp).toBeDefined();
      expect(new Date(responseCall.timestamp)).toBeInstanceOf(Date);
    });

    it('deve incluir path na resposta de erro', () => {
      mockReq.path = '/users/123';
      authenticateToken(mockReq, mockRes, mockNext);

      const responseCall = mockRes.json.mock.calls[0][0];
      expect(responseCall.path).toBe('/users/123');
    });

    it('deve incluir path padrão quando não definido', () => {
      delete mockReq.path;
      authenticateToken(mockReq, mockRes, mockNext);

      const responseCall = mockRes.json.mock.calls[0][0];
      expect(responseCall.path).toBeDefined();
    });
  });

  describe('Performance', () => {
    it('deve processar token rapidamente', () => {
      const validToken = jwt.sign(
        { id: 1, email: 'admin@spsgroup.com.br', type: 'admin' },
        'test-secret-key',
        { expiresIn: '1h' }
      );

      mockReq.headers.authorization = `Bearer ${validToken}`;

      const startTime = Date.now();
      authenticateToken(mockReq, mockRes, mockNext);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(100); // Deve ser rápido
      expect(mockNext).toHaveBeenCalled();
    });

    it('deve rejeitar token inválido rapidamente', () => {
      mockReq.headers.authorization = 'Bearer invalid-token';

      const startTime = Date.now();
      authenticateToken(mockReq, mockRes, mockNext);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(100); // Deve ser rápido
      expect(mockRes.status).toHaveBeenCalledWith(403);
    });
  });

  describe('Segurança', () => {
    it('deve não expor informações sensíveis em caso de erro', () => {
      mockReq.headers.authorization = 'Bearer invalid-token';

      authenticateToken(mockReq, mockRes, mockNext);

      const responseCall = mockRes.json.mock.calls[0][0];
      expect(responseCall.error).toBe('Token inválido ou expirado');
      expect(responseCall).not.toHaveProperty('token');
      expect(responseCall).not.toHaveProperty('payload');
    });

    it('deve não modificar req.user em caso de erro', () => {
      mockReq.headers.authorization = 'Bearer invalid-token';

      authenticateToken(mockReq, mockRes, mockNext);

      expect(mockReq.user).toBeUndefined();
    });

    it('deve não chamar next() em caso de erro', () => {
      mockReq.headers.authorization = 'Bearer invalid-token';

      authenticateToken(mockReq, mockRes, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});
