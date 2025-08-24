# API SPS Group - Backend

API RESTful para gerenciamento de usuários com autenticação JWT.

## 🚀 Funcionalidades Implementadas

- ✅ Autenticação JWT
- ✅ CRUD completo de usuários
- ✅ Banco de dados fake em memória
- ✅ Validações de dados
- ✅ Proteção de rotas
- ✅ Usuário admin pré-cadastrado

## 📋 Pré-requisitos

- Node.js (versão 14 ou superior)
- npm ou yarn

## 🚀 Como Executar

1. Instale as dependências:
```bash
npm install
```

2. Execute o servidor e testes:
```bash
npm run test:full
```

Ou apenas o servidor:
```bash
npm start
```

## 🔐 Credenciais Admin

```json
{
  "email": "admin@spsgroup.com.br",
  "password": "1234"
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

## 🏗️ Estrutura do Projeto

```
src/
├── controllers/
│   ├── authController.js    # Controlador de autenticação
│   └── userController.js    # Controlador de usuários
├── database/
│   └── fakeDatabase.js      # Banco de dados fake em memória
├── middleware/
│   └── auth.js             # Middleware de autenticação JWT
├── routes/
│   ├── auth.js             # Rotas de autenticação
│   └── users.js            # Rotas de usuários
├── index.js                # Arquivo principal do servidor
└── routes.js               # Configuração de rotas
```

## 🧪 Testes

```bash
npm test
```

## 📄 Licença

MIT