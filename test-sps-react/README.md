# SPS React Test

Aplicação React para gerenciamento de usuários com autenticação JWT, recursos de acessibilidade e design responsivo.

## ✅ Funcionalidades

- **Autenticação**: Login JWT com proteção de rotas
- **Usuários**: CRUD completo (listar, criar, editar, excluir)
- **Acessibilidade**: Modo escuro/claro e navegação por teclado
- **Responsivo**: Mobile-first com breakpoints otimizados
- **Modais**: Confirmações e feedback de operações
- **Validações**: Campos obrigatórios, email único, confirmações

## 🚀 Instalação

1. **Instalar dependências:**
```bash
npm install
```

2. **Configurar servidor:**
Criar arquivo `.env`:
```
REACT_APP_SERVER_URL=http://localhost:3000
```

3. **Iniciar aplicação:**
```bash
npm start
```

## 📱 Como Usar

1. Acesse `http://localhost:3001`
2. Login: `admin@spsgroup.com.br` / `Admin@2024!`
3. Gerencie usuários na página principal
4. Use o painel ♿ para acessibilidade

## 🎛️ Acessibilidade

- **Tema**: Alternar claro/escuro
- **Teclado**: Navegação completa via Tab

## 📱 Responsividade

- **Mobile**: Menu hambúrguer, formulários empilhados
- **Tablet**: Grid 2 colunas, tabelas com scroll
- **Desktop**: Layout completo, navegação horizontal
- **Touch**: Botões 44px+, espaçamento otimizado

## 🎭 Modais

- **Confirmação**: Para exclusões e mudanças
- **Sucesso**: Feedback de operações bem-sucedidas
- **Erro**: Mensagens específicas de falhas
- **Fechamento**: Clique fora, X ou Esc

## 🏗️ Estrutura

```
src/
├── components/     # Componentes reutilizáveis
├── contexts/       # Contextos React
├── pages/          # Páginas da aplicação
├── services/       # Serviços de API
├── styles/         # Estilos CSS
└── routes.js       # Configuração de rotas
```

## 🛠️ Tecnologias

- React 18 + Router DOM
- Axios para HTTP
- Context API para estado
- CSS Variables + Grid/Flexbox
- ARIA attributes para acessibilidade

## 📋 Pré-requisitos

- Node.js 14+
- Servidor backend rodando (test-sps-server)

## 🧪 Scripts

- `npm start` - Desenvolvimento
- `npm run build` - Produção
- `npm test` - Testes
- `npm run test:integration` - Teste de integração (usando script centralizado)

## 🤖 Scripts de Automação

Para facilitar o desenvolvimento, use os scripts centralizados na pasta `scripts/`:

```bash
# Iniciar todos os serviços
node ../scripts/start-dev.js
.\..\scripts\start-dev.ps1
..\scripts\start-dev.bat

# Parar todos os serviços
node ../scripts/stop-dev.js
.\..\scripts\stop-dev.ps1
..\scripts\stop-dev.bat

# Executar teste de integração
node ../scripts/test-integration.js
```

## 🔗 API Necessária

Certifique-se que o backend tenha as rotas:
- `POST /auth/login`
- `GET /users`
- `POST /users`
- `PUT /users/:id`
- `DELETE /users/:id`
