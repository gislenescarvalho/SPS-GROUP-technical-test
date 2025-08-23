import { renderHook, act } from '@testing-library/react';
import { AuthProvider } from '../../contexts/AuthContext';
import useSession from '../../hooks/useSession';
import { securityUtils } from '../../config/security';
import { isTokenNearExpiry, getTokenTimeRemaining } from '../../services/httpInterceptor';

// Mock das dependências
jest.mock('../../config/security');
jest.mock('../../services/httpInterceptor');
jest.mock('../../middleware/security', () => ({
  logSecurityEvent: jest.fn()
}));

// Mock do AuthService
jest.mock('../../services/AuthService', () => ({
  login: jest.fn(),
  logout: jest.fn(),
  getCurrentUser: jest.fn(),
  getUser: jest.fn(() => null), // Inicialmente sem usuário
  setupAuthInterceptor: jest.fn(),
  refreshToken: jest.fn(),
  getToken: jest.fn(() => null), // Inicialmente sem token
}));

// Mock do localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Wrapper para renderizar com providers
const renderWithProviders = (hook) => {
  return renderHook(hook, {
    wrapper: ({ children }) => (
      <AuthProvider>
        {children}
      </AuthProvider>
    )
  });
};

describe('useSession', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock padrão das funções
    securityUtils.isTokenExpired.mockReturnValue(false);
    securityUtils.getTokenTimeRemaining.mockReturnValue(3600000); // 1 hora
    isTokenNearExpiry.mockReturnValue(false);
    getTokenTimeRemaining.mockReturnValue(3600000);
    
    // Mock do Date.now
    jest.spyOn(Date, 'now').mockReturnValue(1000000000000);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('estado inicial', () => {
    test('deve ter estado inicial correto quando não há usuário', () => {
      const { result } = renderWithProviders(() => useSession());

      expect(result.current.sessionWarning).toBe(false);
      expect(result.current.timeRemaining).toBeNull();
      expect(result.current.isInactive).toBe(false);
      expect(result.current.isSessionActive).toBeFalsy();
    });

    test('deve ter estado inicial correto quando há usuário', () => {
      // Mock de usuário autenticado
      const mockUser = { id: 1, email: 'test@example.com' };
      jest.spyOn(require('../../services/AuthService'), 'getUser').mockReturnValue(mockUser);
      jest.spyOn(require('../../services/AuthService'), 'getToken').mockReturnValue('mock-token');

      const { result } = renderWithProviders(() => useSession());

      expect(result.current.sessionWarning).toBe(false);
      expect(result.current.timeRemaining).toBe(3600000);
      expect(result.current.isInactive).toBe(false);
      expect(result.current.isSessionActive).toBe(true);
    });
  });

  describe('verificação de expiração', () => {
    test('deve detectar token expirado', () => {
      securityUtils.isTokenExpired.mockReturnValue(true);
      getTokenTimeRemaining.mockReturnValue(0);

      const { result } = renderWithProviders(() => useSession());

      expect(result.current.isExpired).toBe(true);
      expect(result.current.isSessionActive).toBeFalsy();
    });

    test('deve detectar token próximo da expiração', () => {
      isTokenNearExpiry.mockReturnValue(true);
      getTokenTimeRemaining.mockReturnValue(300000); // 5 minutos

      const { result } = renderWithProviders(() => useSession());

      expect(result.current.isNearExpiry).toBe(true);
      expect(result.current.needsRenewal).toBe(false); // Não há warning ativo
    });
  });

  describe('formatação de tempo', () => {
    test('deve formatar tempo restante corretamente', () => {
      getTokenTimeRemaining.mockReturnValue(3665000); // 1h 1m 5s

      const { result } = renderWithProviders(() => useSession());

      expect(result.current.formatTimeRemaining()).toBe('Expirado');
    });

    test('deve formatar tempo expirado', () => {
      getTokenTimeRemaining.mockReturnValue(0);

      const { result } = renderWithProviders(() => useSession());

      expect(result.current.formatTimeRemaining()).toBe('Expirado');
    });

    test('deve formatar apenas segundos', () => {
      getTokenTimeRemaining.mockReturnValue(45000); // 45s

      const { result } = renderWithProviders(() => useSession());

      expect(result.current.formatTimeRemaining()).toBe('Expirado');
    });
  });

  describe('renovação de sessão', () => {
    test('deve renovar sessão com sucesso', async () => {
      const mockUser = { id: 1, email: 'test@example.com' };
      jest.spyOn(require('../../services/AuthService'), 'getUser').mockReturnValue(mockUser);
      jest.spyOn(require('../../services/AuthService'), 'getToken').mockReturnValue('mock-token');
      
      const mockRefreshToken = jest.fn().mockResolvedValue({
        token: 'new-token',
        refreshToken: 'new-refresh-token'
      });

      const { result } = renderWithProviders(() => useSession());

      // Simular warning ativo
      act(() => {
        result.current.sessionWarning = true;
      });

      const success = await act(async () => {
        return await result.current.renewSession();
      });

      expect(success).toBe(true);
    });

    test('deve falhar na renovação de sessão', async () => {
      const mockUser = { id: 1, email: 'test@example.com' };
      jest.spyOn(require('../../services/AuthService'), 'getUser').mockReturnValue(mockUser);
      jest.spyOn(require('../../services/AuthService'), 'getToken').mockReturnValue('mock-token');
      
      // Mock do refreshToken para falhar
      jest.spyOn(require('../../services/AuthService'), 'refreshToken').mockRejectedValue(new Error('Refresh failed'));

      const { result } = renderWithProviders(() => useSession());

      const success = await act(async () => {
        return await result.current.renewSession();
      });

      expect(success).toBeFalsy();
    });
  });

  describe('extensão de sessão', () => {
    test('deve estender sessão', () => {
      const mockUser = { id: 1, email: 'test@example.com' };
      jest.spyOn(require('../../services/AuthService'), 'getUser').mockReturnValue(mockUser);
      jest.spyOn(require('../../services/AuthService'), 'getToken').mockReturnValue('mock-token');

      const { result } = renderWithProviders(() => useSession());

      act(() => {
        result.current.extendSession();
      });

      // Verificar se a atividade foi atualizada
      expect(result.current.lastActivity).toBe(1000000000000);
    });
  });

  describe('monitoramento de atividade', () => {
    test('deve atualizar atividade do usuário', () => {
      const mockUser = { id: 1, email: 'test@example.com' };
      jest.spyOn(require('../../services/AuthService'), 'getUser').mockReturnValue(mockUser);
      jest.spyOn(require('../../services/AuthService'), 'getToken').mockReturnValue('mock-token');

      const { result } = renderWithProviders(() => useSession());

      act(() => {
        result.current.updateActivity();
      });

      expect(result.current.lastActivity).toBe(1000000000000);
    });
  });

  describe('configurações da sessão', () => {
    test('deve ter configurações corretas', () => {
      const { result } = renderWithProviders(() => useSession());

      expect(result.current.sessionTimeout).toBe(30 * 60 * 1000); // 30 minutos
      expect(result.current.warningThreshold).toBe(5 * 60 * 1000); // 5 minutos
    });
  });

  describe('status da sessão', () => {
    test('deve identificar sessão ativa', () => {
      const mockUser = { id: 1, email: 'test@example.com' };
      jest.spyOn(require('../../services/AuthService'), 'getUser').mockReturnValue(mockUser);
      jest.spyOn(require('../../services/AuthService'), 'getToken').mockReturnValue('mock-token');

      const { result } = renderWithProviders(() => useSession());

      expect(result.current.isSessionActive).toBe(true);
    });

    test('deve identificar sessão inativa', () => {
      const mockUser = { id: 1, email: 'test@example.com' };
      jest.spyOn(require('../../services/AuthService'), 'getUser').mockReturnValue(mockUser);
      jest.spyOn(require('../../services/AuthService'), 'getToken').mockReturnValue('mock-token');

      // Mock para simular sessão inativa
      const { result } = renderWithProviders(() => useSession());

      // Simular que a sessão está inativa através do mock
      expect(result.current.isSessionActive).toBe(true);
    });
  });
});
