# Integração Frontend-Backend

Este documento descreve a integração completa entre o frontend React e o backend Node.js/Express.

## 📋 Visão Geral

A integração foi implementada com as seguintes funcionalidades:

- **Autenticação JWT** com refresh automático de tokens
- **Interceptors HTTP** para gerenciamento automático de headers
- **Paginação e busca** na listagem de usuários
- **Métricas do sistema** em tempo real
- **Tratamento de erros** centralizado
- **Cache** inteligente
- **Validação** de dados

## 🚀 Configuração

### 1. Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto frontend:

```env
# Configuração da API do Backend
REACT_APP_SERVER_URL=http://localhost:3000

# Configurações de Desenvolvimento
REACT_APP_ENV=development
REACT_APP_DEBUG=true

# Configurações de Timeout
REACT_APP_API_TIMEOUT=10000

# Configurações de Cache
REACT_APP_CACHE_ENABLED=true
REACT_APP_CACHE_TTL=300000
```

### 2. Iniciar os Serviços

```bash
# Terminal 1 - Backend
cd test-sps-server
npm install
npm run dev

# Terminal 2 - Frontend
cd test-sps-react
npm install
npm start
```

## 🔧 Arquitetura da Integração

### Estrutura de Arquivos

```
src/
├── config/
│   └── api.js                 # Configuração centralizada da API
├── services/
│   ├── httpInterceptor.js     # Interceptor HTTP com autenticação
│   ├── AuthService.js         # Serviços de autenticação
│   ├── UserService.js         # Serviços de usuários
│   └── MetricsService.js      # Serviços de métricas
├── hooks/
│   └── useApi.js              # Hook para gerenciar estados da API
└── pages/
    ├── Users.js               # Lista de usuários com paginação
    └── Metrics.js             # Dashboard de métricas
```

### Fluxo de Autenticação

1. **Login**: Usuário faz login com email/senha
2. **Tokens**: Backend retorna `token` e `refreshToken`
3. **Storage**: Tokens são salvos no localStorage
4. **Interceptor**: Token é adicionado automaticamente em todas as requisições
5. **Refresh**: Quando o token expira, o interceptor renova automaticamente
6. **Logout**: Tokens são removidos e usuário é redirecionado

## 📡 Endpoints Integrados

### Autenticação (`/auth`)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/auth/login` | Login do usuário |
| POST | `/auth/logout` | Logout do usuário |
| POST | `/auth/refresh` | Renovar token |
| GET | `/auth/stats` | Estatísticas de autenticação |

### Usuários (`/users`)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/users` | Listar usuários (com paginação) |
| GET | `/users/:id` | Buscar usuário por ID |
| POST | `/users` | Criar novo usuário |
| PUT | `/users/:id` | Atualizar usuário |
| DELETE | `/users/:id` | Deletar usuário |

### Métricas (`/metrics`)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/metrics` | Métricas gerais |
| GET | `/metrics/performance` | Métricas de performance |
| GET | `/metrics/users` | Métricas de usuários |
| GET | `/metrics/auth` | Métricas de autenticação |
| GET | `/metrics/cache` | Métricas de cache |

## 🎯 Funcionalidades Implementadas

### 1. Autenticação Inteligente

```javascript
// Login automático com refresh de token
const { user, token, refreshToken } = await AuthService.login(email, password);

// Refresh automático quando token expira
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Renovar token automaticamente
      const newToken = await AuthService.refreshToken();
      // Repetir requisição original
    }
  }
);
```

### 2. Paginação e Busca

```javascript
// Listagem com paginação
const users = await UserService.list({
  page: 1,
  limit: 10,
  search: "joão"
});

// Interface com controles de navegação
<div className="pagination-controls">
  <button onClick={() => setPage(page - 1)}>Anterior</button>
  <span>Página {page} de {totalPages}</span>
  <button onClick={() => setPage(page + 1)}>Próxima</button>
</div>
```

### 3. Métricas em Tempo Real

```javascript
// Dashboard de métricas
const metrics = await MetricsService.getMetrics();

// Cards de métricas
<MetricCard
  title="Total de Usuários"
  value={metrics.totalUsers}
  subtitle="Usuários registrados"
  icon="👥"
/>
```

### 4. Tratamento de Erros

```javascript
// Hook personalizado para gerenciar estados
const { loading, error, execute } = useApi();

// Tratamento centralizado
try {
  const data = await execute(UserService.list);
} catch (error) {
  // Erro tratado automaticamente
  console.error('Erro:', error.message);
}
```

## 🔒 Segurança

### Headers de Segurança

- **Authorization**: Token JWT em todas as requisições
- **Content-Type**: `application/json`
- **X-API-Version**: Controle de versão da API

### Validação de Dados

```javascript
// Validação no frontend
const validation = await validateData(createUserSchema, userData);
if (!validation.isValid) {
  setErrors(validation.errors);
  return;
}

// Validação no backend (Joi)
const { error } = createUserSchema.validate(userData);
if (error) {
  throw new Error(error.details[0].message);
}
```

## 📊 Cache e Performance

### Cache Inteligente

- **Cache de usuários**: 5 minutos
- **Cache de métricas**: 1 minuto
- **Invalidação automática** após operações de escrita

### Otimizações

- **Lazy loading** de componentes
- **Debounce** na busca
- **Pagination** para grandes listas
- **Memoização** de dados

## 🧪 Testes

### Testes de Integração

```bash
# Testar autenticação
npm test -- --testPathPattern=SignIn.test.js

# Testar listagem de usuários
npm test -- --testPathPattern=Users.test.js

# Testar métricas
npm test -- --testPathPattern=Metrics.test.js
```

### Testes de API

```bash
# Backend
cd test-sps-server
npm run test:integration

# Frontend
cd test-sps-react
npm run test:coverage
```

## 🚨 Troubleshooting

### Problemas Comuns

1. **CORS Error**
   ```bash
   # Verificar se o backend está rodando na porta 3000
   # Verificar configurações de CORS no backend
   ```

2. **Token Expirado**
   ```javascript
   // Verificar se o refresh token está funcionando
   // Verificar se os tokens estão sendo salvos corretamente
   ```

3. **Erro 401/403**
   ```javascript
   // Verificar se o usuário tem permissão
   // Verificar se o token está sendo enviado
   ```

### Logs de Debug

```javascript
// Habilitar logs de debug
localStorage.setItem('debug', 'true');

// Ver logs no console do navegador
console.log('API Response:', response);
console.log('Auth Token:', localStorage.getItem('token'));
```

## 📈 Monitoramento

### Métricas Disponíveis

- **Performance**: Tempo de resposta, taxa de requisições
- **Usuários**: Total, ativos, novos usuários
- **Autenticação**: Logins, tokens ativos, tentativas falhadas
- **Cache**: Hit rate, uso de memória, expirações

### Alertas

- **Erros 5xx**: Erros do servidor
- **Taxa de erro alta**: Muitas requisições falhando
- **Cache miss**: Baixa taxa de acerto do cache

## 🔄 Deploy

### Produção

```bash
# Build do frontend
npm run build

# Configurar variáveis de ambiente de produção
REACT_APP_SERVER_URL=https://api.seusite.com
REACT_APP_ENV=production
```

### Docker

```dockerfile
# Dockerfile para frontend
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 📚 Recursos Adicionais

- [Documentação da API](./API_DOCUMENTATION.md)
- [Guia de Testes](./TESTING_README.md)
- [Validações](./VALIDATION_README.md)
- [Acessibilidade](./src/styles/accessibility.css)

## 🤝 Contribuição

Para contribuir com a integração:

1. Siga os padrões de código estabelecidos
2. Adicione testes para novas funcionalidades
3. Atualize a documentação
4. Teste a integração completa

---

**Desenvolvido com ❤️ para o teste SPS Group**
