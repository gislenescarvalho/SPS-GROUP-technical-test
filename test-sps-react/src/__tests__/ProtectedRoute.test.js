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

  test('deve renderizar o conteúdo quando autenticado', () => {
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

  test('deve redirecionar quando não autenticado', () => {
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
    expect(mockNavigate).toHaveBeenCalledWith('/signin');
  });
});
