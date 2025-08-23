# SPS Group - Teste de Desenvolvimento

Este repositório contém dois projetos: um servidor backend em Node.js e um frontend em React.

## 📁 Estrutura do Projeto

```
solution-testes-coder/
├── test-sps-server/     # Backend em Node.js/Express
└── test-sps-react/      # Frontend em React
```

## 🚀 Como Executar o Projeto

### Pré-requisitos

- **Node.js** (versão 16 ou superior)
- **npm** ou **yarn**
- **Redis** (opcional, para cache)

### 1. Configuração do Backend (test-sps-server)

#### Instalação das dependências:
```bash
cd test-sps-server
npm install
```

#### Configuração do ambiente:
```bash
# Copie o arquivo de exemplo
cp env.example .env

# Edite o arquivo .env com suas configurações
# As configurações padrão já estão adequadas para desenvolvimento
```

#### Executar o servidor:
```bash
# Modo desenvolvimento (com hot reload)
npm run dev

# Modo produção
npm start
```

O servidor estará disponível em: `http://localhost:3000`

#### Comandos disponíveis:
- `npm run dev` - Executa em modo desenvolvimento com nodemon
- `npm start` - Executa em modo produção
- `npm test` - Executa os testes unitários
- `npm run test:watch` - Executa os testes em modo watch
- `npm run test:coverage` - Executa os testes com cobertura
- `npm run test:integration` - Executa apenas os testes de integração

### 2. Configuração do Frontend (test-sps-react)

#### Instalação das dependências:
```bash
cd test-sps-react
npm install
```

#### Configuração do ambiente:
```bash
# Copie o arquivo de exemplo
cp env.development.example .env.development

# Edite o arquivo .env.development se necessário
# Por padrão, aponta para http://localhost:3000 (backend)
```

#### Executar o frontend:
```bash
# Modo desenvolvimento
npm start
# ou
npm run dev
```

O frontend estará disponível em: `http://localhost:3001`

#### Comandos disponíveis:
- `npm start` - Executa em modo desenvolvimento
- `npm run dev` - Alias para npm start
- `npm run build` - Gera build de produção
- `npm test` - Executa os testes
- `npm run test:watch` - Executa os testes em modo watch
- `npm run test:coverage` - Executa os testes com cobertura
- `npm run test:integration` - Executa testes de integração

## 🔧 Configuração Completa

### Passo a passo completo:

1. **Clone o repositório** (se ainda não fez):
```bash
git clone <url-do-repositorio>
cd solution-testes-coder
```

2. **Configure o backend**:
```bash
cd test-sps-server
npm install
cp env.example .env
npm run dev
```

3. **Em outro terminal, configure o frontend**:
```bash
cd test-sps-react
npm install
cp env.development.example .env.development
npm start
```

4. **Acesse a aplicação**:
- Frontend: http://localhost:3001
- Backend API: http://localhost:3000
- Documentação da API: http://localhost:3000/api-docs

## 📚 Documentação Adicional

### Backend (test-sps-server)
- [Documentação da API](./test-sps-server/API_DOCUMENTATION.md)
- [Avaliação Senior Dev](./test-sps-server/AVALIACAO_SENIOR_DEV.md)
- [Melhorias Implementadas](./test-sps-server/MELHORIAS_IMPLEMENTADAS.md)

### Frontend (test-sps-react)
- [Clean Architecture](./test-sps-react/CLEAN_ARCHITECTURE_README.md)
- [Testes](./test-sps-react/TESTING_README.md)
- [Validações](./test-sps-react/VALIDATION_README.md)
- [Segurança](./test-sps-react/SECURITY_README.md)

## 🛠️ Tecnologias Utilizadas

### Backend
- Node.js + Express
- JWT para autenticação
- Redis para cache
- Joi para validação
- Jest para testes
- Swagger para documentação

### Frontend
- React 18
- React Router DOM
- Axios para requisições HTTP
- Yup para validação
- Jest + Testing Library para testes

## 🔍 Troubleshooting

### Problemas comuns:

1. **Porta 3000 já em uso**:
   - Altere a porta no arquivo `.env` do backend
   - Atualize a URL no `.env.development` do frontend

2. **Erro de CORS**:
   - Verifique se as origens estão configuradas no backend
   - Confirme se o frontend está rodando na porta correta

3. **Dependências não encontradas**:
   - Delete as pastas `node_modules` e `package-lock.json`
   - Execute `npm install` novamente

4. **Redis não disponível**:
   - O projeto funciona sem Redis, mas algumas funcionalidades de cache podem não estar disponíveis
   - Para instalar Redis: https://redis.io/download

## 📝 Notas

- O backend usa um banco de dados fake em memória para demonstração
- Os dados são perdidos ao reiniciar o servidor
- Para produção, configure um banco de dados real
- O frontend está configurado para se conectar ao backend na porta 3000
