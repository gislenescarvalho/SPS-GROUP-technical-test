# API SPS Group - CRUD de Usuários

## Visão Geral

API RESTful para gerenciamento de usuários com autenticação JWT.

## Base URL

```
http://localhost:3000
```

## Autenticação

Todas as rotas (exceto login) requerem autenticação via JWT Token no header:

```
Authorization: Bearer <seu_token_jwt>
```

## Endpoints

### 1. Autenticação

#### POST /auth/login
Faz login do usuário e retorna um token JWT.

**Body:**
```json
{
  "email": "admin@spsgroup.com.br",
  "password": "1234"
}
```

**Response (200):**
```json
{
  "user": {
    "id": 1,
    "name": "admin",
    "email": "admin@spsgroup.com.br",
    "type": "admin"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 2. Usuários

#### GET /users
Lista todos os usuários (requer autenticação).

**Response (200):**
```json
[
  {
    "id": 1,
    "name": "admin",
    "email": "admin@spsgroup.com.br",
    "type": "admin"
  },
  {
    "id": 2,
    "name": "João Silva",
    "email": "joao@email.com",
    "type": "user"
  }
]
```

#### GET /users/:id
Busca um usuário específico por ID (requer autenticação).

**Response (200):**
```json
{
  "id": 2,
  "name": "João Silva",
  "email": "joao@email.com",
  "type": "user"
}
```

#### POST /users
Cria um novo usuário (requer autenticação).

**Body:**
```json
{
  "name": "Maria Santos",
  "email": "maria@email.com",
  "type": "user",
  "password": "123456"
}
```

**Response (201):**
```json
{
  "id": 3,
  "name": "Maria Santos",
  "email": "maria@email.com",
  "type": "user"
}
```

#### PUT /users/:id
Atualiza um usuário existente (requer autenticação).

**Body:**
```json
{
  "name": "Maria Santos Silva",
  "email": "maria.silva@email.com"
}
```

**Response (200):**
```json
{
  "id": 3,
  "name": "Maria Santos Silva",
  "email": "maria.silva@email.com",
  "type": "user"
}
```

#### DELETE /users/:id
Remove um usuário (requer autenticação).

**Response (204):** Sem conteúdo

## Códigos de Status

- `200` - Sucesso
- `201` - Criado com sucesso
- `204` - Removido com sucesso
- `400` - Dados inválidos
- `401` - Não autenticado
- `403` - Acesso negado
- `404` - Não encontrado
- `500` - Erro interno do servidor

## Validações

### Campos Obrigatórios
- `name`: Nome do usuário
- `email`: Email único do usuário
- `type`: Tipo do usuário ("admin" ou "user")
- `password`: Senha do usuário

### Regras de Negócio
- Email deve ser único no sistema
- Tipo deve ser "admin" ou "user"
- Não é possível deletar o usuário admin principal
- Senhas não são criptografadas (conforme especificação)

## Usuário Admin Padrão

O sistema já possui um usuário admin pré-cadastrado:

```json
{
  "id": 1,
  "name": "admin",
  "email": "admin@spsgroup.com.br",
  "type": "admin",
  "password": "1234"
}
```

## Exemplo de Uso com cURL

### 1. Fazer Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@spsgroup.com.br", "password": "1234"}'
```

### 2. Listar Usuários (com token)
```bash
curl -X GET http://localhost:3000/users \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

### 3. Criar Usuário
```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{"name": "Novo Usuário", "email": "novo@email.com", "type": "user", "password": "123456"}'
```

### 4. Atualizar Usuário
```bash
curl -X PUT http://localhost:3000/users/2 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{"name": "Nome Atualizado"}'
```

### 5. Deletar Usuário
```bash
curl -X DELETE http://localhost:3000/users/2 \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```
