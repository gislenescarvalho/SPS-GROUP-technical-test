import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AccessibilityProvider } from './contexts/AccessibilityContext';

// Mock dos serviços
jest.mock('./services/AuthService', () => ({
  login: jest.fn(),
  logout: jest.fn(),
  getToken: jest.fn(),
  getUser: jest.fn(),
  isAuthenticated: jest.fn(),
  setupAuthInterceptor: jest.fn(),
}));

jest.mock('./services/UserService', () => ({
  list: jest.fn(),
  get: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  checkEmailExists: jest.fn(),
  validateUserData: jest.fn(),
}));

// Função para renderizar componentes com providers
const AllTheProviders = ({ children }) => {
  return (
    <BrowserRouter>
      <AccessibilityProvider>
        <AuthProvider>
          {children}
        </AuthProvider>
      </AccessibilityProvider>
    </BrowserRouter>
  );
};

// Função customizada de render
const customRender = (ui, options) =>
  render(ui, { wrapper: AllTheProviders, ...options });

// Função para renderizar apenas com AuthProvider
const renderWithAuth = (ui, options) => {
  const Wrapper = ({ children }) => (
    <BrowserRouter>
      <AuthProvider>
        {children}
      </AuthProvider>
    </BrowserRouter>
  );
  return render(ui, { wrapper: Wrapper, ...options });
};

// Função para renderizar apenas com AccessibilityProvider
const renderWithAccessibility = (ui, options) => {
  const Wrapper = ({ children }) => (
    <BrowserRouter>
      <AccessibilityProvider>
        {children}
      </AccessibilityProvider>
    </BrowserRouter>
  );
  return render(ui, { wrapper: Wrapper, ...options });
};

// Mock de usuário para testes
export const mockUser = {
  id: 1,
  name: 'Admin User',
  email: 'admin@spsgroup.com.br',
  type: 'admin'
};

// Mock de dados de usuários para testes
export const mockUsers = [
  {
    id: 1,
    name: 'Admin User',
    email: 'admin@spsgroup.com.br',
    type: 'admin'
  },
  {
    id: 2,
    name: 'Test User',
    email: 'test@example.com',
    type: 'user'
  }
];

// Função para limpar todos os mocks
export const clearAllMocks = () => {
  jest.clearAllMocks();
  localStorage.clear();
};

// Função para simular login
export const simulateLogin = () => {
  localStorage.setItem('token', 'mock-token');
  localStorage.setItem('user', JSON.stringify(mockUser));
};

// Função para simular logout
export const simulateLogout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// Re-export everything
export * from '@testing-library/react';
export { customRender as render, renderWithAuth, renderWithAccessibility };
