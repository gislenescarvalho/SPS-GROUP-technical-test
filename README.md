# SPS Group - Teste de Desenvolvimento

Sistema completo de gerenciamento de usuários com backend Node.js/Express e frontend React, incluindo autenticação JWT e recursos de acessibilidade.

## 📁 Estrutura do Projeto

```
SPS-GROUP-technical-test/
├── test-sps-server/           # Backend em Node.js/Express
│   ├── src/
│   │   ├── config/           # Configurações da aplicação
│   │   ├── controllers/      # Controladores da API
│   │   ├── database/         # Banco de dados fake
│   │   ├── middleware/       # Middlewares (auth, security, etc.)
│   │   ├── routes/           # Definição de rotas
│   │   ├── services/         # Lógica de negócio
│   │   ├── utils/            # Utilitários
│   │   └── validations/      # Schemas de validação
│   ├── tests/                # Testes unitários e integração
│   └── package.json
├── test-sps-react/            # Frontend em React
│   ├── src/
│   │   ├── components/       # Componentes reutilizáveis
│   │   ├── contexts/         # Contextos React
│   │   ├── hooks/            # Custom hooks
│   │   ├── pages/            # Páginas da aplicação
│   │   ├── services/         # Serviços de API
│   │   ├── styles/           # Estilos CSS
│   │   └── validations/      # Validações de formulário
│   ├── __tests__/            # Testes unitários
│   └── package.json
├── start-dev.js              # Script de inicialização cross-platform
├── start-dev.ps1             # Script PowerShell para Windows
├── start-dev.bat             # Script Batch para Windows
└── README.md                 # Este arquivo
```

## 🚀 Pré-requisitos
- **Node.js** (versão 16+)
- **npm** ou **yarn**
- **Git** (para clonar o repositório)
- **Navegador moderno** (Chrome, Firefox, Safari, Edge)


## 🤖 Scripts de Automação

**⚠️ Recomendado:** Use os scripts de automação para uma experiência mais simples e rápida!

### Scripts de Inicialização

#### Windows (PowerShell) - Recomendado
```powershell
.\start-dev.ps1
```

#### Cross-Platform (JavaScript)
```bash
node start-dev.js
```

#### Windows (Batch)
```cmd
start-dev.bat
```

### Scripts de Parada

#### Cross-Platform (JavaScript) - Recomendado
```bash
node stop-dev.js
```

#### Windows (PowerShell)
```powershell
.\stop-dev.ps1
```

#### Windows (Batch)
```cmd
stop-dev.bat
```

### O que os Scripts Fazem
- ✅ **Verificação automática** de pré-requisitos (Node.js, npm/yarn)
- ✅ **Configuração automática** de arquivos de ambiente (.env)
- ✅ **Instalação automática** de dependências (backend + frontend)
- ✅ **Inicialização simultânea** dos serviços
- ✅ **Interface amigável** com logs coloridos
- ✅ **Tratamento de erros** robusto

### Opções dos Scripts
```bash
# Apenas instalar dependências
node start-dev.js --install-only

# Pular instalação (após primeira execução)
node start-dev.js --skip-install

# Exibir ajuda
node start-dev.js --help
```

**📖 Documentação completa:** [SCRIPTS_README.md](./SCRIPTS_README.md)

---

### Execução Manual (Alternativa)

### 1. Backend (test-sps-server)
```bash
cd test-sps-server
npm install
cp env.example .env

npm run dev
```
**Servidor:** http://localhost:3000
**API Docs:** http://localhost:3000/api-docs

### 2. Frontend (test-sps-react)
```bash
cd test-sps-react
npm install
cp env.development.example .env.development
npm start
```
**Aplicação:** http://localhost:3001

## 🔐 Acesso

**⚠️ Dados de Demonstração:** Este é um projeto de teste com dados mockados.

```json
{
  "email": "admin@spsgroup.com.br",
  "password": "Admin@2024!"
}
```

**Nota:** Os dados são simulados e serão perdidos ao reiniciar o servidor.

## 🛠️ Tecnologias

### Backend
- **Node.js + Express** - Framework web e roteamento
- **JWT** - Autenticação e autorização
- **Joi** - Validação de dados e schemas
- **bcryptjs** - Hash de senhas
- **Jest** - Framework de testes
- **Swagger/OpenAPI** - Documentação da API
- **node-cache** - Cache em memória
- **express-rate-limit** - Rate limiting
- **cors** - Cross-Origin Resource Sharing

### Frontend
- **React 18** - Biblioteca de interface
- **React Router DOM** - Roteamento e navegação
- **Axios** - Cliente HTTP para APIs
- **Context API** - Gerenciamento de estado global
- **Jest + React Testing Library** - Testes unitários
- **CSS Variables** - Sistema de design tokens
- **CSS Grid/Flexbox** - Layout responsivo
- **ARIA Attributes** - Acessibilidade web

## 🎯 Funcionalidades

### Backend
- ✅ **Autenticação JWT** com refresh tokens
- ✅ **CRUD completo** de usuários (listar, criar, editar, excluir)
- ✅ **Validação robusta** com Joi (email único, senha forte, etc.)
- ✅ **Middleware de segurança** (CORS, rate limiting, cache)
- ✅ **Cache em memória** (node-cache) para performance
- ✅ **Rate limiting** para proteção contra ataques
- ✅ **Auditoria** de operações (logs de criação/edição/exclusão)
- ✅ **Documentação Swagger** completa da API
- ✅ **Testes unitários e integração** com Jest
- ✅ **Versionamento** da API
- ✅ **Banco de dados fake** em memória para demonstração

### Frontend
- ✅ **Interface responsiva** com design mobile-first
- ✅ **Autenticação JWT** com proteção de rotas
- ✅ **CRUD completo** de usuários com modais de confirmação
- ✅ **Painel de acessibilidade** (tema escuro/claro, fonte, contraste)
- ✅ **Validação de formulários** em tempo real
- ✅ **Navegação por teclado** completa
- ✅ **Modais interativos** para feedback e confirmações
- ✅ **Testes unitários** com React Testing Library
- ✅ **Gestão de sessão** com avisos de expiração
- ✅ **Indicador de força de senha** em tempo real

## 📚 Documentação

- **API Docs:** http://localhost:3000/api-docs
- **Backend:** [README detalhado](./test-sps-server/readme.md)
- **Frontend:** [README detalhado](./test-sps-react/README.md)

## ♿ Recursos de Acessibilidade

### Frontend
- **Tema adaptável**: Alternância entre modo claro e escuro
- **Controle de fonte**: A-, A, A+ para diferentes tamanhos
- **Alto contraste**: Modo de alto contraste para melhor visibilidade
- **Redução de movimento**: Opção para desabilitar animações
- **Navegação por teclado**: Navegação completa via Tab, Enter, Esc
- **ARIA labels**: Atributos de acessibilidade em todos os elementos
- **Foco visível**: Indicadores claros de foco para navegação

### Backend
- **Validação robusta**: Verificação de dados de entrada
- **Mensagens de erro claras**: Feedback específico para problemas
- **Rate limiting**: Proteção contra ataques automatizados
- **Logs estruturados**: Rastreamento de operações para auditoria

## 🔧 Comandos Úteis

### Scripts de Automação
```bash
# Iniciar todos os serviços
node start-dev.js           # Cross-platform
.\start-dev.ps1             # Windows PowerShell
start-dev.bat               # Windows Batch

# Parar todos os serviços
node stop-dev.js            # Cross-platform
.\stop-dev.ps1              # Windows PowerShell
stop-dev.bat                # Windows Batch
```

### Backend
```bash
npm run dev          # Desenvolvimento
npm start           # Produção
npm test            # Testes
npm run test:watch  # Testes em watch
```

### Frontend
```bash
npm start           # Desenvolvimento
npm run build       # Build produção
npm test            # Testes
npm run test:watch  # Testes em watch
```

## ⚠️ Troubleshooting

### Scripts de Automação
- **Erro de permissão (Windows):** Execute PowerShell como administrador
- **Node.js não encontrado:** Instale Node.js em https://nodejs.org/
- **Porta ocupada:** Use `node stop-dev.js` para parar serviços anteriores
- **Arquivo .env não criado:** Execute `node start-dev.js --install-only`

### Backend
- **Porta 3000 ocupada:** Altere `PORT` no `.env` do backend
- **JWT_SECRET não configurado:** Configure no `.env` do backend (obrigatório)
- **Erro de CORS:** Verifique `CORS_ORIGIN` no `.env` do backend
- **Dependências:** Delete `node_modules` e `package-lock.json`, execute `npm install`

### Frontend
- **Porta 3001 ocupada:** Altere `PORT` no `.env.development` do frontend
- **Erro de conexão com API:** Verifique se o backend está rodando na porta 3000
- **Build falha:** Verifique se todas as dependências estão instaladas
- **Testes falham:** Execute `npm test -- --watchAll=false` para ver detalhes

### Geral
- **Credenciais não funcionam:** Use `admin@spsgroup.com.br` / `Admin@2024!`
- **Dados perdidos:** O banco é fake em memória, reinicie para resetar
- **Performance lenta:** Verifique se o cache está habilitado no backend

## 📝 Notas

### Características do Projeto
- **Banco de dados fake:** Dados simulados em memória (perdidos ao reiniciar)
- **Credenciais fixas:** `admin@spsgroup.com.br` / `Admin@2024!` para demonstração
- **Configuração local:** Otimizado para desenvolvimento local
- **Acessibilidade completa:** Conformidade com WCAG 2.1
- **Cobertura de testes:** Testes unitários e integração para frontend e backend

### Limitações
- **Projeto de demonstração:** Não recomendado para produção sem adaptações
- **Sem persistência:** Dados são perdidos ao reiniciar o servidor
- **Autenticação simples:** JWT sem refresh tokens avançados
- **Sem banco real:** Usa banco fake em memória

### Próximos Passos para Produção
- Implementar banco de dados real (PostgreSQL, MongoDB)
- Adicionar refresh tokens para JWT
- Configurar HTTPS e certificados SSL
- Implementar logging estruturado
- Adicionar monitoramento e métricas
- Configurar CI/CD pipeline
