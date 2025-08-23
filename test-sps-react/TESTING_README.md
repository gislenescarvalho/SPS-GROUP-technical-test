# Testes com React Testing Library - SPS React Test

## Visão Geral

Este projeto implementa uma suíte completa de testes usando **React Testing Library** para garantir a qualidade e confiabilidade da aplicação. Os testes seguem as melhores práticas de testing, focando no comportamento do usuário e na acessibilidade.

## Arquitetura de Testes

### 📁 **Estrutura de Arquivos**

```
src/
├── __tests__/                    # Testes organizados por funcionalidade
│   ├── SignIn.test.js           # Testes do componente de login
│   ├── ProtectedRoute.test.js   # Testes de proteção de rotas
│   ├── FormField.test.js        # Testes do componente de campo
│   └── UserForm.test.js         # Testes de integração de formulário
├── __mocks__/                    # Mocks e stubs
│   └── fileMock.js              # Mock para arquivos estáticos
├── test-utils.js                 # Utilitários e configurações de teste
├── setupTests.js                 # Configuração global dos testes
└── jest.config.js               # Configuração do Jest
```

### 🛠️ **Tecnologias Utilizadas**

- **React Testing Library**: Biblioteca principal para testes
- **Jest**: Framework de testes
- **@testing-library/user-event**: Simulação de interações do usuário
- **@testing-library/jest-dom**: Matchers adicionais para DOM

## Testes Implementados

### ✅ **1. Testes de Login (SignIn.test.js)**

#### **Funcionalidades Testadas:**
- Renderização correta do formulário
- Validação de campos obrigatórios
- Validação de formato de email
- Funcionalidade de login
- Estados de loading
- Tratamento de erros
- Acessibilidade

#### **Cenários de Teste:**
```javascript
// Exemplo de teste de validação
test('deve mostrar erro quando email está vazio', async () => {
  const user = userEvent.setup();
  render(<SignIn />);
  
  const emailInput = screen.getByLabelText('Campo de email');
  const passwordInput = screen.getByLabelText('Campo de senha');
  const submitButton = screen.getByRole('button', { name: /entrar/i });
  
  await user.clear(emailInput);
  await user.type(passwordInput, '1234');
  await user.click(submitButton);
  
  await waitFor(() => {
    expect(screen.getByText('Email é obrigatório')).toBeInTheDocument();
  });
});
```

### ✅ **2. Testes de Proteção de Rota (ProtectedRoute.test.js)**

#### **Funcionalidades Testadas:**
- Renderização de conteúdo protegido
- Redirecionamento para login
- Estados de loading
- Transições de estado
- Casos extremos
- Integração com AuthContext

#### **Cenários de Teste:**
```javascript
// Exemplo de teste de redirecionamento
test('deve redirecionar para /signin quando usuário não autenticado', () => {
  useAuth.mockReturnValue({
    isAuthenticated: false,
    loading: false,
    user: null
  });

  render(
    <ProtectedRoute>
      <TestComponent />
    </ProtectedRoute>
  );

  expect(screen.getByTestId('navigate')).toBeInTheDocument();
  expect(mockNavigate).toHaveBeenCalledWith('/signin');
});
```

### ✅ **3. Testes de Componente de Campo (FormField.test.js)**

#### **Funcionalidades Testadas:**
- Renderização de diferentes tipos de input
- Validação e exibição de erros
- Campos obrigatórios e desabilitados
- Interações do usuário
- Acessibilidade
- Estilização

#### **Cenários de Teste:**
```javascript
// Exemplo de teste de acessibilidade
test('deve ter label associado ao input', () => {
  render(<FormField {...defaultProps} />);
  
  const input = screen.getByRole('textbox');
  const label = screen.getByText('Test Label');
  
  expect(input).toHaveAttribute('id');
  expect(label).toHaveAttribute('for', input.id);
});
```

### ✅ **4. Testes de Integração de Formulário (UserForm.test.js)**

#### **Funcionalidades Testadas:**
- Criação de usuário
- Validação completa de formulário
- Verificação de email duplicado
- Estados de loading e erro
- Acessibilidade do formulário

#### **Cenários de Teste:**
```javascript
// Exemplo de teste de integração
test('deve criar usuário com sucesso', async () => {
  const user = userEvent.setup();
  UserService.list.mockResolvedValue([]);
  UserService.checkEmailExists.mockResolvedValue(false);
  UserService.create.mockResolvedValue({
    id: 2,
    name: 'Test User',
    email: 'test@example.com',
    type: 'user'
  });
  
  render(<Users />);
  
  // Abrir e preencher formulário
  const createButton = screen.getByRole('button', { name: /criar primeiro usuário/i });
  await user.click(createButton);
  
  // Preencher campos
  await user.type(screen.getByLabelText('Nome'), 'Test User');
  await user.type(screen.getByLabelText('Email'), 'test@example.com');
  await user.type(screen.getByLabelText('Senha'), '1234');
  
  // Submeter
  await user.click(screen.getByRole('button', { name: /criar usuário/i }));
  
  // Verificar chamada do serviço
  await waitFor(() => {
    expect(UserService.create).toHaveBeenCalledWith({
      name: 'Test User',
      email: 'test@example.com',
      type: 'user',
      password: '1234'
    });
  });
});
```

## Configuração e Utilitários

### 🔧 **test-utils.js**

Arquivo central com utilitários para testes:

```javascript
// Funções de render customizadas
const customRender = (ui, options) =>
  render(ui, { wrapper: AllTheProviders, ...options });

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

// Mocks e dados de teste
export const mockUser = {
  id: 1,
  name: 'Admin User',
  email: 'admin@spsgroup.com.br',
  type: 'admin'
};

// Funções utilitárias
export const clearAllMocks = () => {
  jest.clearAllMocks();
  localStorage.clear();
};
```

### ⚙️ **setupTests.js**

Configuração global dos testes:

```javascript
import '@testing-library/jest-dom';

// Mock do localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock do window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
```

## Scripts de Teste

### 📜 **Comandos Disponíveis**

```bash
# Executar todos os testes
npm test

# Executar testes em modo watch
npm run test:watch

# Executar testes com cobertura
npm run test:coverage

# Executar testes em CI/CD
npm run test:ci
```

### 📊 **Cobertura de Testes**

Os testes incluem cobertura para:
- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%
- **Statements**: 70%

## Boas Práticas Implementadas

### 🎯 **1. Testes Orientados ao Comportamento**

- Foco no que o usuário vê e faz
- Testes baseados em roles e labels
- Simulação de interações reais do usuário

### ♿ **2. Acessibilidade**

- Testes de navegação por teclado
- Verificação de labels e roles ARIA
- Testes de screen readers

### 🔄 **3. Estados e Transições**

- Testes de loading states
- Testes de estados de erro
- Testes de transições de estado

### 🛡️ **4. Mocks e Isolamento**

- Mocks apropriados de serviços
- Isolamento de componentes
- Dados de teste consistentes

### 📱 **5. Responsividade**

- Testes de diferentes tamanhos de tela
- Testes de interações touch
- Testes de acessibilidade mobile

## Exemplos de Uso

### 🔍 **Como Executar Testes Específicos**

```bash
# Executar apenas testes de login
npm test -- --testNamePattern="SignIn"

# Executar apenas testes de formulário
npm test -- --testNamePattern="FormField"

# Executar testes com verbose
npm test -- --verbose
```

### 🐛 **Debug de Testes**

```javascript
// Usar screen.debug() para inspecionar DOM
test('debug example', () => {
  render(<MyComponent />);
  screen.debug(); // Mostra o DOM atual
});

// Usar screen.logTestingPlaygroundURL() para playground
test('playground example', () => {
  render(<MyComponent />);
  screen.logTestingPlaygroundURL(); // Gera URL para playground
});
```

### 📝 **Escrevendo Novos Testes**

```javascript
import { render, screen, waitFor } from '../test-utils';
import userEvent from '@testing-library/user-event';

describe('Meu Componente', () => {
  test('deve renderizar corretamente', () => {
    render(<MeuComponente />);
    expect(screen.getByText('Texto esperado')).toBeInTheDocument();
  });

  test('deve responder a interações do usuário', async () => {
    const user = userEvent.setup();
    render(<MeuComponente />);
    
    const button = screen.getByRole('button');
    await user.click(button);
    
    await waitFor(() => {
      expect(screen.getByText('Resultado')).toBeInTheDocument();
    });
  });
});
```

## Conclusão

A suíte de testes implementada oferece:

- ✅ **Cobertura completa** dos componentes principais
- ✅ **Testes de integração** para fluxos críticos
- ✅ **Foco em acessibilidade** e UX
- ✅ **Mocks apropriados** para isolamento
- ✅ **Configuração robusta** para CI/CD
- ✅ **Documentação clara** e exemplos práticos

Os testes garantem que a aplicação funcione corretamente e mantenha a qualidade ao longo do desenvolvimento.
