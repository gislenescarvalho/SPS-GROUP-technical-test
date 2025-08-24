import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import { AccessibilityProvider } from '../contexts/AccessibilityContext';
import { ToastProvider } from '../contexts/ToastContext';
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

describe('User Form Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    UserService.list.mockResolvedValue([]);
  });

  test('deve renderizar a página de usuários', () => {
    renderWithProviders(<Users />);
    
    expect(screen.getByText('Carregando usuários...')).toBeInTheDocument();
  });
});