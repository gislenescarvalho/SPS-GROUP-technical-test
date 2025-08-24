# API SPS Group - Backend

API RESTful para gerenciamento de usuários com autenticação JWT.

## 🚀 Funcionalidades Implementadas

- ✅ Autenticação JWT
- ✅ CRUD completo de usuários
- ✅ Banco de dados fake em memória
- ✅ Validações de dados
- ✅ Proteção de rotas
- ✅ Usuário admin pré-cadastrado
- ✅ Cache em memória (node-cache)
- ✅ Rate limiting
- ✅ Métricas de performance
- ✅ Documentação Swagger

## 📋 Pré-requisitos

- Node.js (versão 14 ou superior)
- npm ou yarn

## 🚀 Como Executar

1. Instale as dependências:
```bash
npm install
```

2. Configure as variáveis de ambiente:
```bash
cp env.example .env
```

3. Execute o servidor:
```bash
npm run dev    # Desenvolvimento
npm start      # Produção
```

4. Execute os testes:
```bash
npm test                    # Testes unitários
npm run test:integration    # Testes de integração
npm run test:coverage       # Cobertura de testes
```



## 🔐 Credenciais Admin

```json
{
  "email": "admin@spsgroup.com.br",
  "password": "Admin@2024!"
}
```

## 📚 Endpoints

### Autenticação
- `POST /auth/login` - Login

### Usuários (requer autenticação)
- `GET /users` - Listar usuários
- `GET /users/:id` - Buscar usuário
- `POST /users` - Criar usuário
- `PUT /users/:id` - Atualizar usuário
- `DELETE /users/:id` - Deletar usuário



### Documentação
- `GET /api-docs` - Documentação Swagger

### Versão
- `GET /api/version` - Informações da versão da API

## 🏗️ Estrutura do Projeto

```
src/
├── config/
│   ├── index.js            # Configurações da aplicação
│   └── swagger.js          # Configuração Swagger
├── controllers/
│   ├── authController.js    # Controlador de autenticação
│   ├── userController.js    # Controlador de usuários
│   └── auditController.js   # Controlador de auditoria
├── database/
│   └── fakeDatabase.js      # Banco de dados fake em memória
├── middleware/
│   ├── auth.js             # Middleware de autenticação JWT
│   ├── security.js         # Middleware de segurança
│   └── cache.js            # Middleware de cache
├── routes/
│   ├── auth.js             # Rotas de autenticação
│   ├── users.js            # Rotas de usuários
│   └── docs.js             # Rotas de documentação
├── services/
│   ├── userService.js      # Serviço de usuários
│   └── authService.js      # Serviço de autenticação
├── index.js                # Arquivo principal do servidor
└── routes.js               # Configuração de rotas
```

## 🧪 Testes

```bash
npm test                    # Testes unitários
npm run test:integration    # Testes de integração
npm run test:coverage       # Cobertura de testes
npm run test:watch          # Testes em modo watch
```

## 🔧 Variáveis de Ambiente

Principais variáveis de configuração:

```env
# Servidor
PORT=3000
NODE_ENV=development

# Segurança
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h



# Cache
CACHE_ENABLED=true
CACHE_TTL=300


```

## 📄 Licença

MIT