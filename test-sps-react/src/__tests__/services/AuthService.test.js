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
        user: { id: 1, email: 'admin@test.com', type: 'admin' },
        token: 'mock-token',
        refreshToken: 'mock-refresh-token'
      };

      validateEmail.mockReturnValue(true);
      AuthRepository.login.mockResolvedValue(mockResult);

      const result = await AuthService.login(email, password);

      expect(validateEmail).toHaveBeenCalledWith(email);
      expect(AuthRepository.login).toHaveBeenCalledWith({
        email: email.toLowerCase().trim(),
        password
      });
      expect(secureStorage.setItem).toHaveBeenCalledWith('token', mockResult.token);
      expect(secureStorage.setItem).toHaveBeenCalledWith('refreshToken', mockResult.refreshToken);
      expect(secureStorage.setItem).toHaveBeenCalledWith('user', mockResult.user);
      expect(setAuthToken).toHaveBeenCalledWith(mockResult.token);
      expect(logSecurityEvent).toHaveBeenCalledWith('login_success', {
        userId: mockResult.user.id,
        userEmail: mockResult.user.email
      });
      expect(result).toEqual(mockResult);
    });

    test('deve validar email inválido', async () => {
      const email = 'email-invalido';
      const password = '123456';

      validateEmail.mockReturnValue(false);

      await expect(AuthService.login(email, password)).rejects.toThrow('Email inválido');
      expect(AuthRepository.login).not.toHaveBeenCalled();
    });

    test('deve validar senha muito curta', async () => {
      const email = 'admin@test.com';
      const password = '123';

      validateEmail.mockReturnValue(true);

      await expect(AuthService.login(email, password)).rejects.toThrow('Senha deve ter pelo menos 4 caracteres');
      expect(AuthRepository.login).not.toHaveBeenCalled();
    });

    test('deve lidar com erro de login', async () => {
      const email = 'admin@test.com';
      const password = '123456';
      const error = new Error('Credenciais inválidas');

      validateEmail.mockReturnValue(true);
      AuthRepository.login.mockRejectedValue(error);

      await expect(AuthService.login(email, password)).rejects.toThrow('Credenciais inválidas');
      expect(logSecurityEvent).toHaveBeenCalledWith('login_failed', {
        email,
        error: error.message
      });
    });
  });

  describe('logout', () => {
    test('deve fazer logout com sucesso', async () => {
      const mockUser = { id: 1, email: 'admin@test.com' };
      
      AuthService.getUser = jest.fn().mockReturnValue(mockUser);
      AuthRepository.logout.mockResolvedValue();

      await AuthService.logout();

      expect(AuthRepository.logout).toHaveBeenCalled();
      expect(logSecurityEvent).toHaveBeenCalledWith('logout_success', {
        userId: mockUser.id,
        userEmail: mockUser.email
      });
      expect(secureStorage.removeItem).toHaveBeenCalledWith('token');
      expect(secureStorage.removeItem).toHaveBeenCalledWith('refreshToken');
      expect(secureStorage.removeItem).toHaveBeenCalledWith('user');
      expect(clearAuthToken).toHaveBeenCalled();
    });

    test('deve fazer logout mesmo com erro no servidor', async () => {
      const error = new Error('Erro no servidor');
      
      AuthService.getUser = jest.fn().mockReturnValue(null);
      AuthRepository.logout.mockRejectedValue(error);

      await AuthService.logout();

      expect(AuthRepository.logout).toHaveBeenCalled();
      expect(logSecurityEvent).toHaveBeenCalledWith('logout_error', { error: error.message });
      expect(secureStorage.removeItem).toHaveBeenCalledWith('token');
      expect(secureStorage.removeItem).toHaveBeenCalledWith('refreshToken');
      expect(secureStorage.removeItem).toHaveBeenCalledWith('user');
      expect(clearAuthToken).toHaveBeenCalled();
    });
  });

  describe('getToken', () => {
    test('deve retornar token do storage', () => {
      const mockToken = 'mock-token';
      secureStorage.getItem.mockReturnValue(mockToken);

      const result = AuthService.getToken();

      expect(secureStorage.getItem).toHaveBeenCalledWith('token');
      expect(result).toBe(mockToken);
    });
  });

  describe('getUser', () => {
    test('deve retornar usuário do storage', () => {
      const mockUser = { id: 1, email: 'admin@test.com' };
      secureStorage.getItem.mockReturnValue(JSON.stringify(mockUser));

      const result = AuthService.getUser();

      expect(secureStorage.getItem).toHaveBeenCalledWith('user');
      expect(result).toEqual(mockUser);
    });

    test('deve retornar null quando não há usuário', () => {
      secureStorage.getItem.mockReturnValue(null);

      const result = AuthService.getUser();

      expect(result).toBeNull();
    });

    test('deve retornar usuário quando já é objeto', () => {
      const mockUser = { id: 1, email: 'admin@test.com' };
      secureStorage.getItem.mockReturnValue(mockUser);

      const result = AuthService.getUser();

      expect(result).toEqual(mockUser);
    });
  });

  describe('isAuthenticated', () => {
    test('deve retornar true quando há token', () => {
      secureStorage.getItem.mockReturnValue('mock-token');

      const result = AuthService.isAuthenticated();

      expect(result).toBe(true);
    });

    test('deve retornar false quando não há token', () => {
      secureStorage.getItem.mockReturnValue(null);

      const result = AuthService.isAuthenticated();

      expect(result).toBe(false);
    });
  });

  describe('setupAuthInterceptor', () => {
    test('deve configurar token no interceptor', () => {
      const mockToken = 'mock-token';
      AuthService.getToken = jest.fn().mockReturnValue(mockToken);

      AuthService.setupAuthInterceptor();

      expect(AuthService.getToken).toHaveBeenCalled();
      expect(setAuthToken).toHaveBeenCalledWith(mockToken);
    });

    test('não deve configurar token quando não há token', () => {
      AuthService.getToken = jest.fn().mockReturnValue(null);

      AuthService.setupAuthInterceptor();

      expect(AuthService.getToken).toHaveBeenCalled();
      expect(setAuthToken).not.toHaveBeenCalled();
    });
  });

  describe('refreshToken', () => {
    test('deve renovar token com sucesso', async () => {
      const mockRefreshToken = 'mock-refresh-token';
      const mockNewToken = 'new-token';
      const mockNewRefreshToken = 'new-refresh-token';
      const mockResult = {
        token: mockNewToken,
        refreshToken: mockNewRefreshToken
      };

      secureStorage.getItem.mockReturnValue(mockRefreshToken);
      AuthRepository.refreshToken.mockResolvedValue(mockResult);

      const result = await AuthService.refreshToken();

      expect(secureStorage.getItem).toHaveBeenCalledWith('refreshToken');
      expect(AuthRepository.refreshToken).toHaveBeenCalledWith(mockRefreshToken);
      expect(secureStorage.setItem).toHaveBeenCalledWith('token', mockNewToken);
      expect(secureStorage.setItem).toHaveBeenCalledWith('refreshToken', mockNewRefreshToken);
      expect(setAuthToken).toHaveBeenCalledWith(mockNewToken);
      expect(result).toEqual(mockResult);
    });

    test('deve lançar erro quando não há refresh token', async () => {
      secureStorage.getItem.mockReturnValue(null);

      await expect(AuthService.refreshToken()).rejects.toThrow('Refresh token não encontrado');
      expect(AuthRepository.refreshToken).not.toHaveBeenCalled();
    });

    test('deve propagar erro do repositório', async () => {
      const mockRefreshToken = 'mock-refresh-token';
      const error = new Error('Token expirado');

      secureStorage.getItem.mockReturnValue(mockRefreshToken);
      AuthRepository.refreshToken.mockRejectedValue(error);

      await expect(AuthService.refreshToken()).rejects.toThrow('Token expirado');
    });
  });

  describe('validateToken', () => {
    test('deve validar token com sucesso', async () => {
      const mockResult = { valid: true, user: { id: 1 } };
      AuthRepository.validateToken.mockResolvedValue(mockResult);

      const result = await AuthService.validateToken();

      expect(AuthRepository.validateToken).toHaveBeenCalled();
      expect(result).toEqual(mockResult);
    });

    test('deve retornar inválido quando há erro', async () => {
      const error = new Error('Token inválido');
      AuthRepository.validateToken.mockRejectedValue(error);

      const result = await AuthService.validateToken();

      expect(result).toEqual({ valid: false, user: null });
    });
  });

  describe('getAuthStats', () => {
    test('deve obter estatísticas com sucesso', async () => {
      const mockStats = { totalLogins: 100, failedLogins: 5 };
      AuthRepository.getAuthStats.mockResolvedValue(mockStats);

      const result = await AuthService.getAuthStats();

      expect(AuthRepository.getAuthStats).toHaveBeenCalled();
      expect(result).toEqual(mockStats);
    });

    test('deve propagar erro do repositório', async () => {
      const error = new Error('Erro ao obter estatísticas');
      AuthRepository.getAuthStats.mockRejectedValue(error);

      await expect(AuthService.getAuthStats()).rejects.toThrow('Erro ao obter estatísticas');
    });
  });

  describe('changePassword', () => {
    test('deve alterar senha com sucesso', async () => {
      const passwordData = {
        currentPassword: 'old123',
        newPassword: 'new123',
        confirmPassword: 'new123'
      };
      const mockResult = { success: true };

      AuthRepository.changePassword.mockResolvedValue(mockResult);

      const result = await AuthService.changePassword(passwordData);

      expect(AuthRepository.changePassword).toHaveBeenCalledWith(passwordData);
      expect(result).toEqual(mockResult);
    });

    test('deve validar dados obrigatórios', async () => {
      const passwordData = { currentPassword: 'old123' };

      await expect(AuthService.changePassword(passwordData)).rejects.toThrow('Senha atual e nova senha são obrigatórias');
      expect(AuthRepository.changePassword).not.toHaveBeenCalled();
    });

    test('deve validar comprimento da nova senha', async () => {
      const passwordData = {
        currentPassword: 'old123',
        newPassword: '123',
        confirmPassword: '123'
      };

      await expect(AuthService.changePassword(passwordData)).rejects.toThrow('Nova senha deve ter pelo menos 4 caracteres');
      expect(AuthRepository.changePassword).not.toHaveBeenCalled();
    });

    test('deve validar confirmação de senha', async () => {
      const passwordData = {
        currentPassword: 'old123',
        newPassword: 'new123',
        confirmPassword: 'different'
      };

      await expect(AuthService.changePassword(passwordData)).rejects.toThrow('Nova senha e confirmação não coincidem');
      expect(AuthRepository.changePassword).not.toHaveBeenCalled();
    });
  });

  describe('requestPasswordReset', () => {
    test('deve solicitar reset com sucesso', async () => {
      const email = 'admin@test.com';
      const mockResult = { success: true };

      validateEmail.mockReturnValue(true);
      AuthRepository.requestPasswordReset.mockResolvedValue(mockResult);

      const result = await AuthService.requestPasswordReset(email);

      expect(validateEmail).toHaveBeenCalledWith(email);
      expect(AuthRepository.requestPasswordReset).toHaveBeenCalledWith(email);
      expect(result).toEqual(mockResult);
    });

    test('deve validar email inválido', async () => {
      const email = 'email-invalido';

      validateEmail.mockReturnValue(false);

      await expect(AuthService.requestPasswordReset(email)).rejects.toThrow('Email inválido');
      expect(AuthRepository.requestPasswordReset).not.toHaveBeenCalled();
    });
  });

  describe('resetPassword', () => {
    test('deve resetar senha com sucesso', async () => {
      const token = 'reset-token';
      const newPassword = 'new123';
      const mockResult = { success: true };

      AuthRepository.resetPassword.mockResolvedValue(mockResult);

      const result = await AuthService.resetPassword(token, newPassword);

      expect(AuthRepository.resetPassword).toHaveBeenCalledWith(token, newPassword);
      expect(result).toEqual(mockResult);
    });

    test('deve validar token obrigatório', async () => {
      const token = null;
      const newPassword = 'new123';

      await expect(AuthService.resetPassword(token, newPassword)).rejects.toThrow('Token de reset é obrigatório');
      expect(AuthRepository.resetPassword).not.toHaveBeenCalled();
    });

    test('deve validar comprimento da nova senha', async () => {
      const token = 'reset-token';
      const newPassword = '123';

      await expect(AuthService.resetPassword(token, newPassword)).rejects.toThrow('Nova senha deve ter pelo menos 4 caracteres');
      expect(AuthRepository.resetPassword).not.toHaveBeenCalled();
    });
  });
});

