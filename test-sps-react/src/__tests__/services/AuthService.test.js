import AuthService from '../../services/AuthService';
import AuthRepository from '../../repositories/AuthRepository';
import { setAuthToken, clearAuthToken } from '../../services/httpInterceptor';
import { secureStorage, validateEmail, logSecurityEvent } from '../../middleware/security';

jest.mock('../../repositories/AuthRepository');
jest.mock('../../services/httpInterceptor');
jest.mock('../../middleware/security');

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    test('deve fazer login com sucesso', async () => {
      const email = 'admin@test.com';
      const password = '123456';
      const mockResult = {
        data: {
          user: { id: 1, email: 'admin@test.com', type: 'admin' },
          accessToken: 'mock-token',
          refreshToken: 'mock-refresh-token'
        }
      };

      validateEmail.mockReturnValue(true);
      AuthRepository.login.mockResolvedValue(mockResult);

      const result = await AuthService.login(email, password);

      expect(AuthRepository.login).toHaveBeenCalledWith({
        email: email.toLowerCase().trim(),
        password
      });
      expect(secureStorage.setItem).toHaveBeenCalledWith('token', mockResult.data.accessToken);
      expect(result).toEqual({ 
        success: true, 
        user: mockResult.data.user, 
        token: mockResult.data.accessToken, 
        refreshToken: mockResult.data.refreshToken 
      });
    });

    test('deve validar email inválido', async () => {
      const email = 'email-invalido';
      const password = '123456';

      validateEmail.mockReturnValue(false);

      await expect(AuthService.login(email, password)).rejects.toThrow('Email inválido');
      expect(AuthRepository.login).not.toHaveBeenCalled();
    });

    test('deve lidar com erro de login', async () => {
      const email = 'admin@test.com';
      const password = '123456';
      const error = new Error('Credenciais inválidas');
      error.response = { data: { message: 'Credenciais inválidas' } };

      validateEmail.mockReturnValue(true);
      AuthRepository.login.mockRejectedValue(error);

      await expect(AuthService.login(email, password)).rejects.toThrow('Credenciais inválidas');
    });
  });

  describe('logout', () => {
    test('deve fazer logout com sucesso', async () => {
      const mockUser = { id: 1, email: 'admin@test.com' };
      
      AuthService.getUser = jest.fn().mockReturnValue(mockUser);
      AuthRepository.logout.mockResolvedValue();

      await AuthService.logout();

      expect(AuthRepository.logout).toHaveBeenCalled();
      expect(secureStorage.removeItem).toHaveBeenCalledWith('token');
      expect(clearAuthToken).toHaveBeenCalled();
    });
  });

  describe('getUser', () => {
    test('deve retornar usuário do storage', () => {
      const mockUser = { id: 1, email: 'admin@test.com' };
      secureStorage.getItem.mockReturnValue(mockUser);

      const result = AuthService.getUser();

      expect(secureStorage.getItem).toHaveBeenCalledWith('user');
      expect(result).toEqual(mockUser);
    });

    test('deve retornar null quando não há usuário', () => {
      secureStorage.getItem.mockReturnValue(null);

      const result = AuthService.getUser();

      expect(result).toBeNull();
    });
  });
});

