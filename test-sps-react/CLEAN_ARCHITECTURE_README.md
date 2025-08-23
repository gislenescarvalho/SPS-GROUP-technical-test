# Clean Architecture - Frontend React

## Visão Geral

Este documento descreve a implementação dos princípios de Clean Architecture no frontend React, focando na separação de responsabilidades entre camadas e o uso de interceptors HTTP.

## Estrutura de Camadas

### 1. **Camada de Apresentação (Presentation Layer)**
- **Localização**: `src/pages/`, `src/components/`
- **Responsabilidade**: Interface do usuário, formulários, navegação
- **Dependências**: Apenas camada de aplicação (services)

**Exemplos**:
- `src/pages/Users.js` - Página de listagem de usuários
- `src/pages/SignIn.js` - Página de login
- `src/components/FormField.js` - Componente de campo de formulário

### 2. **Camada de Aplicação (Application Layer)**
- **Localização**: `src/services/`
- **Responsabilidade**: Lógica de negócio, validações, orquestração
- **Dependências**: Camada de infraestrutura (repositories)

**Exemplos**:
- `src/services/UserService.js` - Lógica de negócio para usuários
- `src/services/AuthService.js` - Lógica de negócio para autenticação
- `src/services/MetricsService.js` - Lógica de negócio para métricas

### 3. **Camada de Infraestrutura (Infrastructure Layer)**
- **Localização**: `src/repositories/`, `src/services/httpInterceptor.js`
- **Responsabilidade**: Acesso a dados, comunicação HTTP, configurações
- **Dependências**: APIs externas, configurações

**Exemplos**:
- `src/repositories/UserRepository.js` - Acesso aos dados de usuários
- `src/repositories/AuthRepository.js` - Acesso aos dados de autenticação
- `src/repositories/MetricsRepository.js` - Acesso aos dados de métricas
- `src/services/httpInterceptor.js` - Interceptor HTTP centralizado

## Padrão Repository

### Implementação

Cada entidade possui seu próprio repositório que abstrai o acesso aos dados:

```javascript
// UserRepository.js
class UserRepository {
  async findAll(params = {}) {
    // Implementação do acesso aos dados
  }
  
  async findById(id) {
    // Implementação do acesso aos dados
  }
  
  async create(userData) {
    // Implementação do acesso aos dados
  }
}
```

### Benefícios

1. **Abstração**: O acesso aos dados é abstraído da lógica de negócio
2. **Testabilidade**: Facilita a criação de mocks para testes
3. **Flexibilidade**: Permite trocar a fonte de dados sem afetar a lógica de negócio
4. **Reutilização**: Métodos podem ser reutilizados por diferentes serviços

## Interceptors HTTP

### Implementação Centralizada

```javascript
// httpInterceptor.js
import axios from 'axios';
import config from '../config/api';

const api = axios.create({
  baseURL: config.baseURL,
  timeout: config.timeout
});

// Interceptor de requisição
api.interceptors.request.use(
  (config) => {
    // Adicionar token de autenticação
    // Aplicar middleware de segurança
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de resposta
api.interceptors.response.use(
  (response) => {
    // Processar resposta
    return response;
  },
  async (error) => {
    // Tratar erros
    // Renovar token automaticamente
    return Promise.reject(error);
  }
);
```

### Funcionalidades

1. **Autenticação Automática**: Adiciona token JWT em todas as requisições
2. **Refresh Token**: Renova automaticamente tokens expirados
3. **Tratamento de Erros**: Centraliza o tratamento de erros HTTP
4. **Middleware de Segurança**: Aplica validações e sanitização
5. **Logging**: Registra eventos de segurança e erros

## Fluxo de Dados

### Exemplo: Criação de Usuário

```
1. Component (Users.js)
   ↓
2. Service (UserService.js) - Validação de negócio
   ↓
3. Repository (UserRepository.js) - Acesso aos dados
   ↓
4. HTTP Interceptor - Comunicação HTTP
   ↓
5. API Backend
```

### Responsabilidades de Cada Camada

1. **Component**: Captura dados do formulário, exibe feedback
2. **Service**: Valida dados, aplica regras de negócio
3. **Repository**: Formata dados, gerencia comunicação HTTP
4. **Interceptor**: Adiciona headers, trata erros, renova tokens

## Validações e Regras de Negócio

### Camada de Serviço

```javascript
// UserService.js
async create(data) {
  // Validação de negócio
  const validation = await this.validateUserData(data, false);
  if (!validation.isValid) {
    throw new Error(Object.values(validation.errors).join(', '));
  }

  return await this.repository.create(data);
}
```

### Tipos de Validação

1. **Validação de Entrada**: Email válido, senha mínima
2. **Validação de Negócio**: Email único, último admin
3. **Validação de Segurança**: Sanitização, XSS prevention

## Configuração Centralizada

### API Configuration

```javascript
// config/api.js
export default {
  baseURL: process.env.REACT_APP_API_URL,
  timeout: 10000,
  endpoints: {
    users: {
      list: '/users',
      create: '/users',
      get: (id) => `/users/${id}`,
      update: (id) => `/users/${id}`,
      delete: (id) => `/users/${id}`
    }
  }
};
```

## Testabilidade

### Estrutura de Testes

```
src/__tests__/
├── components/     # Testes de componentes
├── services/       # Testes de serviços
├── repositories/   # Testes de repositórios
└── integration/    # Testes de integração
```

### Mocking

```javascript
// Mock do repositório para testes
jest.mock('../repositories/UserRepository', () => ({
  findAll: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn()
}));
```

## Benefícios da Implementação

### 1. **Separação de Responsabilidades**
- Cada camada tem uma responsabilidade específica
- Facilita manutenção e evolução do código

### 2. **Testabilidade**
- Camadas isoladas facilitam testes unitários
- Mocks podem ser criados facilmente

### 3. **Flexibilidade**
- Mudanças em uma camada não afetam outras
- Facilita troca de tecnologias

### 4. **Reutilização**
- Código pode ser reutilizado entre diferentes partes da aplicação
- Reduz duplicação de código

### 5. **Manutenibilidade**
- Código organizado e bem estruturado
- Facilita debugging e correção de bugs

## Exemplos de Uso

### Service Layer

```javascript
// UserService.js
class UserService {
  constructor() {
    this.repository = UserRepository;
  }

  async create(data) {
    // Validação de negócio
    const validation = await this.validateUserData(data, false);
    if (!validation.isValid) {
      throw new Error(Object.values(validation.errors).join(', '));
    }

    return await this.repository.create(data);
  }
}
```

### Repository Layer

```javascript
// UserRepository.js
class UserRepository {
  async create(userData) {
    const response = await api.post(config.endpoints.users.create, userData);
    return response.data;
  }
}
```

### Component Layer

```javascript
// Users.js
const Users = () => {
  const { data: users, loading, error, execute: loadUsers } = useApi(
    () => userService.list({ page, limit, search })
  );

  const handleCreate = async (userData) => {
    try {
      await userService.create(userData);
      loadUsers();
    } catch (error) {
      setError(error.message);
    }
  };
};
```

## Conclusão

A implementação da Clean Architecture no frontend React proporciona:

- **Código organizado** e fácil de manter
- **Testabilidade** melhorada
- **Flexibilidade** para mudanças
- **Reutilização** de código
- **Separação clara** de responsabilidades

Esta estrutura facilita o desenvolvimento, manutenção e evolução da aplicação, seguindo os princípios SOLID e boas práticas de desenvolvimento de software.

