import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import { AccessibilityProvider } from '../contexts/AccessibilityContext';
import { ToastProvider } from '../contexts/ToastContext';
import SignIn from '../pages/SignIn';

jest.mock('../services/AuthService', () => ({
  login: jest.fn(),
  logout: jest.fn(),
  getCurrentUser: jest.fn(),
  getUser: jest.fn(),
  setupAuthInterceptor: jest.fn(),
}));

const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      <AccessibilityProvider>
        <AuthProvider>
          <ToastProvider>
            {component}
          </ToastProvider>
        </AuthProvider>
      </AccessibilityProvider>
    </BrowserRouter>
  );
};

describe('SignIn Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('deve renderizar o formulário de login corretamente', () => {
    renderWithProviders(<SignIn />);
    
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('email@example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('********')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /fazer login/i })).toBeInTheDocument();
  });

  test('deve exibir informações do usuário padrão', () => {
    renderWithProviders(<SignIn />);
    
    expect(screen.getByText('Usuário padrão:')).toBeInTheDocument();
    expect(screen.getByText('Email: admin@spsgroup.com.br')).toBeInTheDocument();
    expect(screen.getByText('Senha: Admin@2024!')).toBeInTheDocument();
  });
});