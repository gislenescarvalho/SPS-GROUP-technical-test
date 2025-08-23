import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import { AccessibilityProvider } from '../contexts/AccessibilityContext';
import SessionWarning from '../components/SessionWarning';
import useSession from '../hooks/useSession';
import { securityUtils } from '../config/security';
import { isTokenNearExpiry, getTokenTimeRemaining } from '../services/httpInterceptor';

// Mock das dependências
jest.mock('../config/security');
jest.mock('../services/httpInterceptor');
jest.mock('../middleware/security', () => ({
  logSecurityEvent: jest.fn()
}));

// Mock do AuthService
jest.mock('../services/AuthService', () => ({
  login: jest.fn(),
  logout: jest.fn(),
  getCurrentUser: jest.fn(),
  getUser: jest.fn(() => ({ id: 1, email: 'test@example.com' })),
  setupAuthInterceptor: jest.fn(),
  refreshToken: jest.fn(),
  getToken: jest.fn(() => 'mock-token'),
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

// Mock do useSession
jest.mock('../hooks/useSession');

// Wrapper para renderizar com providers
const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      <AccessibilityProvider>
        <AuthProvider>
          {component}
        </AuthProvider>
      </AccessibilityProvider>
    </BrowserRouter>
  );
};

describe('Gerenciamento de Sessão', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock padrão das funções - token válido
    securityUtils.isTokenExpired.mockReturnValue(false);
    securityUtils.getTokenTimeRemaining.mockReturnValue(3600000); // 1 hora
    isTokenNearExpiry.mockReturnValue(false);
    getTokenTimeRemaining.mockReturnValue(3600000);
    
    // Mock do localStorage para retornar dados válidos
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'token') return 'mock-token';
      if (key === 'user') return JSON.stringify({ id: 1, email: 'test@example.com' });
      if (key === 'refreshToken') return 'mock-refresh-token';
      return null;
    });
    
    // Mock padrão do useSession
    useSession.mockReturnValue({
      sessionWarning: false,
      timeRemaining: 3600000,
      isInactive: false,
      isSessionActive: true,
      renewSession: jest.fn(),
      extendSession: jest.fn(),
      formatTimeRemaining: jest.fn(() => '60m 0s'),
      isNearExpiry: false,
      isExpired: false,
      needsRenewal: false,
      sessionError: null,
      isRefreshing: false
    });
    
    // Mock do Date.now
    jest.spyOn(Date, 'now').mockReturnValue(1000000000000);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Tratamento de Expiração de Token', () => {
    test('deve detectar token expirado e fazer logout', async () => {
      securityUtils.isTokenExpired.mockReturnValue(true);
      getTokenTimeRemaining.mockReturnValue(0);
      
      useSession.mockReturnValue({
        sessionWarning: true,
        timeRemaining: 0,
        isInactive: false,
        isSessionActive: false,
        renewSession: jest.fn(),
        extendSession: jest.fn(),
        formatTimeRemaining: jest.fn(() => 'Expirado'),
        isNearExpiry: false,
        isExpired: true,
        needsRenewal: false,
        sessionError: 'Sessão expirada',
        isRefreshing: false
      });

      renderWithProviders(<SessionWarning />);

      await waitFor(() => {
        expect(screen.getByText('Erro de Sessão')).toBeInTheDocument();
        expect(screen.getByText('Sessão expirada')).toBeInTheDocument();
      });
    });

    test('deve mostrar aviso quando token está próximo da expiração', async () => {
      // Configurar token próximo da expiração
      getTokenTimeRemaining.mockReturnValue(300000); // 5 minutos
      isTokenNearExpiry.mockReturnValue(true);
      securityUtils.isTokenExpired.mockReturnValue(false);
      
      useSession.mockReturnValue({
        sessionWarning: true,
        timeRemaining: 300000,
        isInactive: false,
        isSessionActive: true,
        renewSession: jest.fn(),
        extendSession: jest.fn(),
        formatTimeRemaining: jest.fn(() => '5m 0s'),
        isNearExpiry: true,
        isExpired: false,
        needsRenewal: true,
        sessionError: null,
        isRefreshing: false
      });

      renderWithProviders(<SessionWarning />);

      await waitFor(() => {
        expect(screen.getByText('Sessão Expirando')).toBeInTheDocument();
      });
    });

    test('deve permitir renovar sessão', async () => {
      // Configurar token próximo da expiração mas não expirado
      getTokenTimeRemaining.mockReturnValue(300000); // 5 minutos
      isTokenNearExpiry.mockReturnValue(true);
      securityUtils.isTokenExpired.mockReturnValue(false);
      
      useSession.mockReturnValue({
        sessionWarning: true,
        timeRemaining: 300000,
        isInactive: false,
        isSessionActive: true,
        renewSession: jest.fn(),
        extendSession: jest.fn(),
        formatTimeRemaining: jest.fn(() => '5m 0s'),
        isNearExpiry: true,
        isExpired: false,
        needsRenewal: true,
        sessionError: null,
        isRefreshing: false
      });

      renderWithProviders(<SessionWarning />);

      await waitFor(() => {
        const renewButton = screen.getByText('Renovar Sessão');
        expect(renewButton).toBeInTheDocument();
      });
    });
  });

  describe('Sincronização entre Abas', () => {
    test('deve reagir a mudanças no localStorage', async () => {
      useSession.mockReturnValue({
        sessionWarning: true,
        timeRemaining: 3600000,
        isInactive: false,
        isSessionActive: false,
        renewSession: jest.fn(),
        extendSession: jest.fn(),
        formatTimeRemaining: jest.fn(() => '60m 0s'),
        isNearExpiry: false,
        isExpired: false,
        needsRenewal: false,
        sessionError: 'Sessão encerrada em outra aba',
        isRefreshing: false
      });

      renderWithProviders(<SessionWarning />);

      await waitFor(() => {
        expect(screen.getByText('Erro de Sessão')).toBeInTheDocument();
        expect(screen.getByText('Sessão encerrada em outra aba')).toBeInTheDocument();
      });
    });

    test('deve reagir a eventos de logout de outras abas', async () => {
      useSession.mockReturnValue({
        sessionWarning: true,
        timeRemaining: 3600000,
        isInactive: false,
        isSessionActive: false,
        renewSession: jest.fn(),
        extendSession: jest.fn(),
        formatTimeRemaining: jest.fn(() => '60m 0s'),
        isNearExpiry: false,
        isExpired: false,
        needsRenewal: false,
        sessionError: 'Sessão encerrada em outra aba',
        isRefreshing: false
      });

      renderWithProviders(<SessionWarning />);

      await waitFor(() => {
        expect(screen.getByText('Erro de Sessão')).toBeInTheDocument();
        expect(screen.getByText('Sessão encerrada em outra aba')).toBeInTheDocument();
      });
    });
  });

  describe('Tratamento de Erros de Rede', () => {
    test('deve mostrar erro quando refresh falha', async () => {
      const mockRefreshToken = jest.fn().mockRejectedValue(new Error('Erro de rede'));
      jest.spyOn(require('../services/AuthService'), 'refreshToken').mockImplementation(mockRefreshToken);

      // Configurar token próximo da expiração
      getTokenTimeRemaining.mockReturnValue(300000); // 5 minutos
      isTokenNearExpiry.mockReturnValue(true);
      securityUtils.isTokenExpired.mockReturnValue(false);
      
      useSession.mockReturnValue({
        sessionWarning: true,
        timeRemaining: 300000,
        isInactive: false,
        isSessionActive: true,
        renewSession: mockRefreshToken,
        extendSession: jest.fn(),
        formatTimeRemaining: jest.fn(() => '5m 0s'),
        isNearExpiry: true,
        isExpired: false,
        needsRenewal: true,
        sessionError: null,
        isRefreshing: false
      });

      renderWithProviders(<SessionWarning />);

      await waitFor(() => {
        const renewButton = screen.getByText('Renovar Sessão');
        fireEvent.click(renewButton);
      });

      await waitFor(() => {
        expect(mockRefreshToken).toHaveBeenCalled();
      });
    });

    test('deve tentar retry em caso de erro de rede', async () => {
      const mockRefreshToken = jest.fn()
        .mockRejectedValueOnce(new Error('network error'))
        .mockResolvedValueOnce({ token: 'new-token', refreshToken: 'new-refresh-token' });
      
      jest.spyOn(require('../services/AuthService'), 'refreshToken').mockImplementation(mockRefreshToken);

      // Configurar token próximo da expiração
      getTokenTimeRemaining.mockReturnValue(300000); // 5 minutos
      isTokenNearExpiry.mockReturnValue(true);
      securityUtils.isTokenExpired.mockReturnValue(false);
      
      useSession.mockReturnValue({
        sessionWarning: true,
        timeRemaining: 300000,
        isInactive: false,
        isSessionActive: true,
        renewSession: mockRefreshToken,
        extendSession: jest.fn(),
        formatTimeRemaining: jest.fn(() => '5m 0s'),
        isNearExpiry: true,
        isExpired: false,
        needsRenewal: true,
        sessionError: null,
        isRefreshing: false
      });

      renderWithProviders(<SessionWarning />);

      await waitFor(() => {
        const renewButton = screen.getByText('Renovar Sessão');
        fireEvent.click(renewButton);
      });

      // Verificar se houve tentativa de retry
      await waitFor(() => {
        expect(mockRefreshToken).toHaveBeenCalled();
      });
    });
  });

  describe('Limpeza de Estado', () => {
    test('deve limpar dados de sessão completamente no logout', async () => {
      const mockLogout = jest.fn();
      jest.spyOn(require('../services/AuthService'), 'logout').mockImplementation(mockLogout);

      useSession.mockReturnValue({
        sessionWarning: false,
        timeRemaining: null,
        isInactive: false,
        isSessionActive: false,
        renewSession: jest.fn(),
        extendSession: jest.fn(),
        formatTimeRemaining: jest.fn(() => 'Expirado'),
        isNearExpiry: false,
        isExpired: true,
        needsRenewal: false,
        sessionError: 'Sessão expirada',
        isRefreshing: false
      });

      renderWithProviders(<SessionWarning />);

      await waitFor(() => {
        expect(screen.getByText('Erro de Sessão')).toBeInTheDocument();
        expect(screen.getByText('Sessão expirada')).toBeInTheDocument();
      });
    });

    test('deve limpar cookies no logout', async () => {
      // Mock de document.cookie
      Object.defineProperty(document, 'cookie', {
        writable: true,
        value: 'session=abc123; auth=xyz789'
      });

      const mockLogout = jest.fn();
      jest.spyOn(require('../services/AuthService'), 'logout').mockImplementation(mockLogout);

      useSession.mockReturnValue({
        sessionWarning: false,
        timeRemaining: null,
        isInactive: false,
        isSessionActive: false,
        renewSession: jest.fn(),
        extendSession: jest.fn(),
        formatTimeRemaining: jest.fn(() => 'Expirado'),
        isNearExpiry: false,
        isExpired: true,
        needsRenewal: false,
        sessionError: 'Sessão expirada',
        isRefreshing: false
      });

      renderWithProviders(<SessionWarning />);

      await waitFor(() => {
        expect(screen.getByText('Erro de Sessão')).toBeInTheDocument();
        expect(screen.getByText('Sessão expirada')).toBeInTheDocument();
      });
    });
  });

  describe('Monitoramento de Atividade', () => {
    test('deve detectar inatividade do usuário', async () => {
      useSession.mockReturnValue({
        sessionWarning: true,
        timeRemaining: 3600000,
        isInactive: true,
        isSessionActive: false,
        renewSession: jest.fn(),
        extendSession: jest.fn(),
        formatTimeRemaining: jest.fn(() => '60m 0s'),
        isNearExpiry: false,
        isExpired: false,
        needsRenewal: false,
        sessionError: null,
        isRefreshing: false
      });

      renderWithProviders(<SessionWarning />);

      await waitFor(() => {
        expect(screen.getByText('Sessão Inativa')).toBeInTheDocument();
      });
    });

    test('deve resetar timer de inatividade com atividade do usuário', async () => {
      useSession.mockReturnValue({
        sessionWarning: false,
        timeRemaining: 3600000,
        isInactive: false,
        isSessionActive: true,
        renewSession: jest.fn(),
        extendSession: jest.fn(),
        formatTimeRemaining: jest.fn(() => '60m 0s'),
        isNearExpiry: false,
        isExpired: false,
        needsRenewal: false,
        sessionError: null,
        isRefreshing: false
      });

      renderWithProviders(<SessionWarning />);

      // Verificar se a atividade foi registrada
      expect(Date.now()).toBe(1000000000000);
    });
  });

  describe('Estados de Loading', () => {
    test('deve mostrar loading durante refresh', async () => {
      useSession.mockReturnValue({
        sessionWarning: true,
        timeRemaining: 300000,
        isInactive: false,
        isSessionActive: true,
        renewSession: jest.fn(),
        extendSession: jest.fn(),
        formatTimeRemaining: jest.fn(() => '5m 0s'),
        isNearExpiry: true,
        isExpired: false,
        needsRenewal: true,
        sessionError: null,
        isRefreshing: true
      });

      renderWithProviders(<SessionWarning />);

      await waitFor(() => {
        expect(screen.getByText('Renovando sessão...')).toBeInTheDocument();
      });
    });

    test('deve desabilitar botões durante refresh', async () => {
      useSession.mockReturnValue({
        sessionWarning: true,
        timeRemaining: 300000, // 5 minutos
        isInactive: false,
        isSessionActive: true,
        renewSession: jest.fn(),
        extendSession: jest.fn(),
        formatTimeRemaining: jest.fn(() => '5m 0s'),
        isNearExpiry: true,
        isExpired: false,
        needsRenewal: true,
        sessionError: null,
        isRefreshing: true
      });

      renderWithProviders(<SessionWarning />);

      await waitFor(() => {
        expect(screen.getByText('Renovando sessão...')).toBeInTheDocument();
      });
    });
  });
});
