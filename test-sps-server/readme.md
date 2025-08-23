# API SPS Group - CRUD de Usuários

API RESTful para gerenciamento de usuários com autenticação JWT, desenvolvida em Node.js com Express.

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

## 🛠️ Instalação

1. Clone o repositório
2. Instale as dependências:
```bash
npm install
```

## 🏃‍♂️ Como Executar

### Opção 1: Executar servidor e testes automaticamente
```bash
npm run test:full
```

### Opção 2: Executar apenas o servidor
```bash
npm start
# ou
npm run dev
```

### Opção 3: Executar apenas os testes (servidor deve estar rodando)
```bash
npm test
```

## 🔐 Credenciais do Admin

O sistema possui um usuário admin pré-cadastrado:

```json
{
  "email": "admin@spsgroup.com.br",
  "password": "1234"
}
```

## 📚 Endpoints da API

### Autenticação
- `POST /auth/login` - Login do usuário

### Usuários (requer autenticação)
- `GET /users` - Listar todos os usuários
- `GET /users/:id` - Buscar usuário por ID
- `POST /users` - Criar novo usuário
- `PUT /users/:id` - Atualizar usuário
- `DELETE /users/:id` - Deletar usuário

## 🧪 Testes

O projeto inclui testes automatizados que verificam:

1. ✅ Conexão com a API
2. ✅ Autenticação JWT
3. ✅ Listagem de usuários
4. ✅ Criação de usuários
5. ✅ Validação de email duplicado
6. ✅ Atualização de usuários
7. ✅ Remoção de usuários

## 📖 Documentação Completa

Consulte o arquivo `API_DOCUMENTATION.md` para documentação detalhada da API com exemplos de uso.

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

## 🔧 Scripts Disponíveis

- `npm start` - Inicia o servidor
- `npm run dev` - Inicia o servidor em modo desenvolvimento com nodemon
- `npm test` - Executa os testes (servidor deve estar rodando)
- `npm run test:full` - Inicia o servidor e executa os testes automaticamente

## 📝 Regras de Negócio

- ✅ Email deve ser único no sistema
- ✅ Tipo de usuário deve ser "admin" ou "user"
- ✅ Não é possível deletar o usuário admin principal
- ✅ Senhas não são criptografadas (conforme especificação)
- ✅ Todas as rotas de usuários requerem autenticação JWT

## 🎯 Checklist de Implementação

- ✅ POST /auth/login: Gera token JWT
- ✅ POST /users: Cadastra usuário (valida e-mail único)
- ✅ GET /users: Lista usuários
- ✅ PUT /users/:id: Edita usuário
- ✅ DELETE /users/:id: Exclui usuário
- ✅ Banco de dados fake em memória
- ✅ Usuário admin pré-cadastrado
- ✅ Rotas protegidas com JWT
- ✅ Validações de dados
- ✅ Tratamento de erros

## 🚨 Solução de Problemas

### Servidor não inicia
- Verifique se a porta 3000 está disponível
- Execute `npm install` para instalar dependências

### Testes falham
- Certifique-se de que o servidor está rodando
- Use `npm run test:full` para executar automaticamente

### Erro de conexão
- Verifique se o servidor está rodando na porta 3000
- Execute `npm start` em um terminal e `npm test` em outro

## 📄 Licença

MIT