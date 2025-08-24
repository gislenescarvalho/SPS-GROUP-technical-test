import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import { useAuth } from '../contexts/AuthContext';

jest.mock('../contexts/AuthContext');

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Navigate: ({ to }) => {
    mockNavigate(to);
    return <div data-testid="navigate">Redirecting to {to}</div>;
  },
}));

const TestComponent = () => <div>Conteúdo Protegido</div>;

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('ProtectedRoute Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockClear();
  });

  describe('Quando usuário está autenticado', () => {
    test('deve renderizar o conteúdo protegido', () => {
      useAuth.mockReturnValue({
        isAuthenticated: true,
        loading: false,
        user: { id: 1, name: 'Admin' }
      });

      renderWithRouter(
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      );

      expect(screen.getByText('Conteúdo Protegido')).toBeInTheDocument();
    });

    test('deve renderizar múltiplos children', () => {
      useAuth.mockReturnValue({
        isAuthenticated: true,
        loading: false,
        user: { id: 1, name: 'Admin' }
      });

      renderWithRouter(
        <ProtectedRoute>
          <div>Child 1</div>
          <div>Child 2</div>
        </ProtectedRoute>
      );

      expect(screen.getByText('Child 1')).toBeInTheDocument();
      expect(screen.getByText('Child 2')).toBeInTheDocument();
    });
  });

  describe('Quando usuário não está autenticado', () => {
    test('deve redirecionar para /signin', () => {
      useAuth.mockReturnValue({
        isAuthenticated: false,
        loading: false,
        user: null
      });

      renderWithRouter(
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      );

      expect(screen.getByTestId('navigate')).toBeInTheDocument();
      expect(screen.getByText('Redirecting to /signin')).toBeInTheDocument();
      expect(mockNavigate).toHaveBeenCalledWith('/signin');
    });

    test('não deve renderizar o conteúdo protegido', () => {
      useAuth.mockReturnValue({
        isAuthenticated: false,
        loading: false,
        user: null
      });

      renderWithRouter(
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      );

      expect(screen.queryByText('Conteúdo Protegido')).not.toBeInTheDocument();
    });
  });

  describe('Durante o carregamento', () => {
    test('deve mostrar loading quando loading é true', () => {
      useAuth.mockReturnValue({
        isAuthenticated: false,
        loading: true,
        user: null
      });

      renderWithRouter(
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      );

      expect(screen.getByText('Carregando...')).toBeInTheDocument();
    });

    test('não deve renderizar conteúdo protegido durante loading', () => {
      useAuth.mockReturnValue({
        isAuthenticated: false,
        loading: true,
        user: null
      });

      renderWithRouter(
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      );

      expect(screen.queryByText('Conteúdo Protegido')).not.toBeInTheDocument();
    });
  });
});
