# SPS Group - Teste de Desenvolvimento

Sistema completo de gerenciamento de usuários com backend Node.js/Express e frontend React, incluindo autenticação JWT e recursos de acessibilidade.

## 📁 Estrutura do Projeto

```
SPS-GROUP-technical-test/
├── test-sps-server/     # Backend em Node.js/Express
└── test-sps-react/      # Frontend em React
```

## 🚀 Pré-requisitos
- **Node.js** (versão 16+)
- **npm** ou **yarn**
- **Git** (para clonar o repositório)
- **Navegador moderno** (Chrome, Firefox, Safari, Edge)
- **Redis** (opcional - para cache avançado)

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
  "password": "1234"
}
```

**Nota:** Os dados são simulados e serão perdidos ao reiniciar o servidor.

## 🛠️ Tecnologias

### Backend
- **Node.js + Express** - Framework web
- **JWT** - Autenticação
- **Joi** - Validação
- **Jest** - Testes
- **Swagger** - Documentação da API

### Frontend
- **React 18** - Interface
- **React Router** - Navegação
- **Axios** - HTTP Client
- **Context API** - Estado
- **Jest + Testing Library** - Testes

## 🎯 Funcionalidades

### Backend
- ✅ Autenticação JWT
- ✅ CRUD de usuários
- ✅ Validação de dados
- ✅ Middleware de segurança
- ✅ Cache com Redis/Node-Cache
- ✅ Documentação Swagger
- ✅ Testes unitários e integração

### Frontend
- ✅ Interface responsiva e acessível
- ✅ Autenticação JWT
- ✅ CRUD de usuários
- ✅ Painel de acessibilidade
- ✅ Validação de formulários
- ✅ Testes unitários

## 📚 Documentação

- **API Docs:** http://localhost:3000/api-docs
- **Backend:** [README detalhado](./test-sps-server/readme.md)
- **Frontend:** [README detalhado](./test-sps-react/README.md)

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

### Geral
- **Porta 3000 ocupada:** Altere no `.env` do backend
- **CORS:** Verifique origens no backend
- **Dependências:** Delete `node_modules` e `package-lock.json`, execute `npm install`
- **Redis:** Opcional, projeto funciona sem ele

## 📝 Notas

- **Banco de dados mockado:** Dados simulados em memória (perdidos ao reiniciar)
- **Acesso simulado:** Credenciais fixas para demonstração
- **Configurado para desenvolvimento local**
- **Inclui recursos completos de acessibilidade**
- **Cobertura de testes para frontend e backend**
- **Projeto de teste:** Não recomendado para produção sem adaptações
