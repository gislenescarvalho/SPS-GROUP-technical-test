# SPS Group - Teste de Desenvolvimento

Sistema completo de gerenciamento de usuários com backend Node.js/Express e frontend React, incluindo autenticação JWT e recursos de acessibilidade.

## 📁 Estrutura do Projeto

```
SPS-GROUP-technical-test/
├── test-sps-server/           # Backend em Node.js/Express
├── test-sps-react/            # Frontend em React
├── scripts/                   # Scripts de automação
└── README.md                  # Este arquivo
```

## 🚀 Pré-requisitos

- **Node.js** (versão 16+)
- **npm** ou **yarn**
- **Git** (para clonar o repositório)
- **Navegador moderno** (Chrome, Firefox, Safari, Edge)

## 🚀 Execução do Projeto

### ⚡ Método Rápido (Recomendado)

Use os scripts de automação para uma experiência mais simples:

#### Windows (PowerShell)
```powershell
.\scripts\start-dev.ps1
```

#### Cross-Platform (JavaScript)
```bash
node scripts/start-dev.js
```

#### Windows (Batch)
```cmd
scripts\start-dev.bat
```

### 🛑 Parando os Serviços

#### Cross-Platform (JavaScript)
```bash
node scripts/stop-dev.js
```

#### Windows (PowerShell)
```powershell
.\scripts\stop-dev.ps1
```

### ⚙️ Opções dos Scripts

```bash
# Apenas instalar dependências
node scripts/start-dev.js --install-only

# Pular instalação (após primeira execução)
node scripts/start-dev.js --skip-install

# Exibir ajuda
node scripts/start-dev.js --help
```

### 📋 O que os Scripts Fazem

- ✅ Verificação automática de pré-requisitos
- ✅ Configuração automática de arquivos de ambiente (.env)
- ✅ Instalação automática de dependências
- ✅ Inicialização simultânea dos serviços
- ✅ Interface amigável com logs coloridos
- ✅ Tratamento de erros robusto


**📖 Documentação completa dos scripts:** [SCRIPTS_README.md](./scripts/SCRIPTS_README.md)

### 🔧 Execução Manual (Alternativa)

#### 1. Backend
```bash
cd test-sps-server
npm install
cp env.example .env
npm run dev
```
**Servidor:** http://localhost:3000 | **API Docs:** http://localhost:3000/api-docs

#### 2. Frontend
```bash
cd test-sps-react
npm install
cp env.example .env
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

## 📚 Documentação

- **API Docs:** http://localhost:3000/api/docs/#/
- **Backend:** [README detalhado](./test-sps-server/readme.md)
- **Frontend:** [README detalhado](./test-sps-react/README.md)

## ⚠️ Troubleshooting

### Scripts de Automação
- **Erro de permissão (Windows):** Execute PowerShell como administrador
- **Node.js não encontrado:** Instale Node.js em https://nodejs.org/
- **Porta ocupada:** Use `node scripts/stop-dev.js` para parar serviços anteriores
- **Arquivo .env não criado:** Execute `node scripts/start-dev.js --install-only`

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
