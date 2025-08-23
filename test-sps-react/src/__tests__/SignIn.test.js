import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import { AccessibilityProvider } from '../contexts/AccessibilityContext';
import SignIn from '../pages/SignIn';

// Mock do AuthService
jest.mock('../services/AuthService', () => ({
  login: jest.fn(),
  logout: jest.fn(),
  getCurrentUser: jest.fn(),
  getUser: jest.fn(),
  setupAuthInterceptor: jest.fn(),
}));

// Wrapper para renderizar com providers necessários
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

describe('SignIn Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Renderização', () => {
    test('deve renderizar o formulário de login corretamente', () => {
      renderWithProviders(<SignIn />);
      
      // Verificar elementos principais
      expect(screen.getByText('Login')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('admin@spsgroup.com.br')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('1234')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /fazer login/i })).toBeInTheDocument();
    });

    test('deve exibir informações do usuário padrão', () => {
      renderWithProviders(<SignIn />);
      
      expect(screen.getByText('Usuário padrão:')).toBeInTheDocument();
      expect(screen.getByText('Email: admin@spsgroup.com.br')).toBeInTheDocument();
      expect(screen.getByText('Senha: 1234')).toBeInTheDocument();
    });

    test('deve exibir informações sobre acessibilidade', () => {
      renderWithProviders(<SignIn />);
      
      expect(screen.getByText(/♿ Use o botão de acessibilidade/)).toBeInTheDocument();
    });
  });

  describe('Acessibilidade', () => {
    test('deve ter labels apropriados para screen readers', () => {
      renderWithProviders(<SignIn />);
      
      expect(screen.getByRole('textbox', { name: /email/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /fazer login/i })).toBeInTheDocument();
    });

    test('deve ter botão de acessibilidade', () => {
      renderWithProviders(<SignIn />);
      
      expect(screen.getByLabelText(/abrir painel de acessibilidade/i)).toBeInTheDocument();
    });
  });
});