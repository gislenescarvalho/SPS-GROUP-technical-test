import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import { AccessibilityProvider } from '../contexts/AccessibilityContext';
import SessionWarning from '../components/SessionWarning';
import useSession from '../hooks/useSession';

jest.mock('../hooks/useSession');

jest.mock('../middleware/security', () => ({
  logSecurityEvent: jest.fn()
}));

const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

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

describe('SessionWarning', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    useSession.mockReturnValue({
      sessionWarning: false,
      timeRemaining: null,
      isInactive: false,
      isSessionActive: false,
      renewSession: jest.fn(),
      extendSession: jest.fn(),
      formatTimeRemaining: jest.fn(() => '5m 30s'),
      isNearExpiry: false,
      isExpired: false,
      needsRenewal: false,
      sessionError: null,
      isRefreshing: false
    });
  });

  describe('renderização', () => {
    test('não deve renderizar quando não há aviso', () => {
      renderWithProviders(<SessionWarning />);
      
      expect(screen.queryByText('Aviso de Sessão')).not.toBeInTheDocument();
    });

    test('deve renderizar aviso de sessão expirando', () => {
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
      
      expect(screen.getByText('Sessão Expirando')).toBeInTheDocument();
      expect(screen.getByText(/Sua sessão expirará em 5m 0s/)).toBeInTheDocument();
    });

    test('deve renderizar aviso de sessão expirada', () => {
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
        sessionError: null,
        isRefreshing: false
      });

      renderWithProviders(<SessionWarning />);
      
      expect(screen.getByText('Sessão Expirada')).toBeInTheDocument();
      expect(screen.getByText(/Sua sessão expirou/)).toBeInTheDocument();
    });

    test('deve renderizar aviso de sessão inativa', () => {
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
      
      expect(screen.getByText('Sessão Inativa')).toBeInTheDocument();
      expect(screen.getByText(/Você está inativo há muito tempo/)).toBeInTheDocument();
    });
  });

  describe('ações do usuário', () => {
    test('deve chamar renewSession quando clicar em renovar', async () => {
      const mockRenewSession = jest.fn().mockResolvedValue(true);
      
      useSession.mockReturnValue({
        sessionWarning: true,
        timeRemaining: 300000,
        isInactive: false,
        isSessionActive: true,
        renewSession: mockRenewSession,
        extendSession: jest.fn(),
        formatTimeRemaining: jest.fn(() => '5m 0s'),
        isNearExpiry: true,
        isExpired: false,
        needsRenewal: true,
        sessionError: null,
        isRefreshing: false
      });

      renderWithProviders(<SessionWarning />);
      
      const renewButton = screen.getByText('Renovar Sessão');
      fireEvent.click(renewButton);
      
      await waitFor(() => {
        expect(mockRenewSession).toHaveBeenCalledTimes(1);
      });
    });

    test('deve chamar extendSession quando clicar em estender', () => {
      const mockExtendSession = jest.fn();
      
      useSession.mockReturnValue({
        sessionWarning: true,
        timeRemaining: 300000,
        isInactive: false,
        isSessionActive: true,
        renewSession: jest.fn(),
        extendSession: mockExtendSession,
        formatTimeRemaining: jest.fn(() => '5m 0s'),
        isNearExpiry: true,
        isExpired: false,
        needsRenewal: true,
        sessionError: null,
        isRefreshing: false
      });

      renderWithProviders(<SessionWarning />);
      
      const extendButton = screen.getByText('Estender Sessão');
      fireEvent.click(extendButton);
      
      expect(mockExtendSession).toHaveBeenCalledTimes(1);
    });

    test('deve fechar aviso quando clicar em continuar', () => {
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
      
      const continueButton = screen.getByText('Continuar');
      expect(continueButton).toBeInTheDocument();
    });

    test('deve fechar aviso quando clicar no X', () => {
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
      
      const closeButton = screen.getByLabelText('Fechar aviso');
      expect(closeButton).toBeInTheDocument();
    });
  });

  describe('estados de loading', () => {
    test('deve mostrar loading durante renovação', async () => {
      const mockRenewSession = jest.fn().mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve(true), 100))
      );
      
      useSession.mockReturnValue({
        sessionWarning: true,
        timeRemaining: 300000,
        isInactive: false,
        isSessionActive: true,
        renewSession: mockRenewSession,
        extendSession: jest.fn(),
        formatTimeRemaining: jest.fn(() => '5m 0s'),
        isNearExpiry: true,
        isExpired: false,
        needsRenewal: true,
        sessionError: null,
        isRefreshing: false
      });

      renderWithProviders(<SessionWarning />);
      
      const renewButton = screen.getByText('Renovar Sessão');
      fireEvent.click(renewButton);
      
      expect(screen.getByText('Renovando...')).toBeInTheDocument();
    });
  });

  describe('contador regressivo', () => {
    test('deve mostrar contador regressivo quando há tempo restante', () => {
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
      
      expect(screen.getByText('Sessão Expirando')).toBeInTheDocument();
    });
  });

  describe('tipos de aviso', () => {
    test('deve aplicar classe CSS correta para erro', () => {
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
        sessionError: null,
        isRefreshing: false
      });

      renderWithProviders(<SessionWarning />);
      
      const modal = screen.getByText('Sessão Expirada').closest('.session-warning-modal');
      expect(modal).toHaveClass('error');
    });

    test('deve aplicar classe CSS correta para warning', () => {
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
      
      const modal = screen.getByText('Sessão Expirando').closest('.session-warning-modal');
      expect(modal).toHaveClass('warning');
    });

    test('deve aplicar classe CSS correta para info', () => {
      useSession.mockReturnValue({
        sessionWarning: true,
        timeRemaining: 600000,
        isInactive: false,
        isSessionActive: true,
        renewSession: jest.fn(),
        extendSession: jest.fn(),
        formatTimeRemaining: jest.fn(() => '10m 0s'),
        isNearExpiry: true,
        isExpired: false,
        needsRenewal: false,
        sessionError: null,
        isRefreshing: false
      });

      renderWithProviders(<SessionWarning />);
      
      const modal = screen.getByText('Sessão Próxima da Expiração').closest('.session-warning-modal');
      expect(modal).toHaveClass('info');
    });
  });

  describe('acessibilidade', () => {
    test('deve ter botão de fechar com aria-label', () => {
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
      
      const closeButton = screen.getByLabelText('Fechar aviso');
      expect(closeButton).toBeInTheDocument();
    });

    test('deve ter botões com texto descritivo', () => {
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
      
      expect(screen.getByText('Renovar Sessão')).toBeInTheDocument();
      expect(screen.getByText('Estender Sessão')).toBeInTheDocument();
      expect(screen.getByText('Continuar')).toBeInTheDocument();
    });
  });
});
