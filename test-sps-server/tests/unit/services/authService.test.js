const authService = require('../../../src/services/authService');
const database = require('../../../src/database/fakeDatabase');
const { generateToken } = require('../../../src/middleware/auth');

// Mock das dependências
jest.mock('../../../src/database/fakeDatabase');
jest.mock('../../../src/middleware/auth');

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('deve fazer login com credenciais válidas', async () => {
      const user = {
        id: 1,
        name: 'Admin',
        email: 'admin@test.com',
        type: 'admin'
      };
      
      const mockToken = 'mock-jwt-token';
      const expectedResult = {
        user,
        token: mockToken
      };
      
      database.authenticateUser.mockResolvedValue(user);
      generateToken.mockReturnValue(mockToken);
      
      const result = await authService.login('admin@test.com', '1234');
      
      expect(database.authenticateUser).toHaveBeenCalledWith('admin@test.com', '1234');
      expect(generateToken).toHaveBeenCalledWith(user);
      expect(result).toEqual(expectedResult);
    });

    it('deve lançar erro quando email está faltando', async () => {
      await expect(authService.login('', '1234')).rejects.toThrow('Email e senha são obrigatórios');
    });

    it('deve lançar erro quando senha está faltando', async () => {
      await expect(authService.login('admin@test.com', '')).rejects.toThrow('Email e senha são obrigatórios');
    });

    it('deve lançar erro quando usuário não existe', async () => {
      database.authenticateUser.mockResolvedValue(null);
      
      await expect(authService.login('nonexistent@test.com', '1234')).rejects.toThrow('Credenciais inválidas');
    });

    it('deve lançar erro quando senha está incorreta', async () => {
      database.authenticateUser.mockResolvedValue(null);
      
      await expect(authService.login('admin@test.com', 'wrongpassword')).rejects.toThrow('Credenciais inválidas');
    });
  });

  describe('logout', () => {
    it('deve fazer logout com sucesso', () => {
      const token = 'mock-jwt-token';
      const result = authService.logout(token);
      
      expect(result).toEqual({
        success: true,
        message: 'Logout realizado com sucesso'
      });
    });
  });

  describe('validateToken', () => {
    it('deve validar token como válido', () => {
      const token = 'mock-jwt-token';
      const result = authService.validateToken(token);
      
      expect(result).toBe(true);
    });
  });
});
