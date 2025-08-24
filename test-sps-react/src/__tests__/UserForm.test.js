import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import { AccessibilityProvider } from '../contexts/AccessibilityContext';
import Users from '../pages/Users';
import UserService from '../services/UserService';

jest.mock('../services/UserService');

jest.mock('../services/AuthService', () => ({
  login: jest.fn(),
  logout: jest.fn(),
  getCurrentUser: jest.fn(),
  getUser: jest.fn(),
  setupAuthInterceptor: jest.fn(),
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  Link: ({ children, to, ...props }) => <a href={to} {...props}>{children}</a>,
}));

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

describe('User Form Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockClear();
    
    UserService.list.mockResolvedValue([]);
    UserService.create.mockResolvedValue({ id: 1, name: 'Test User' });
  });

  describe('Renderização Básica', () => {
    test('deve renderizar a página de usuários', () => {
      renderWithProviders(<Users />);
      
      expect(screen.getByText('Nenhum usuário encontrado')).toBeInTheDocument();
    });

    test('deve ter botão de acessibilidade', () => {
      renderWithProviders(<Users />);
      
      expect(screen.getByLabelText(/abrir painel de acessibilidade/i)).toBeInTheDocument();
    });
  });
});