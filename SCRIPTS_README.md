# Scripts de Automação - SPS Group Technical Test

Este diretório contém scripts para automatizar a instalação de dependências e subida do frontend e backend do projeto SPS Group Technical Test.

## 📋 Pré-requisitos

- **Node.js** (versão 14 ou superior)
- **npm** ou **yarn** (gerenciador de pacotes)

## 🚀 Scripts Disponíveis

### Scripts de Inicialização

#### 1. PowerShell Script (Windows) - `start-dev.ps1`

**Recomendado para Windows com PowerShell**

```powershell
# Executar com todas as opções
.\start-dev.ps1

# Apenas instalar dependências
.\start-dev.ps1 -InstallOnly

# Pular instalação e iniciar serviços
.\start-dev.ps1 -SkipInstall

# Exibir ajuda
.\start-dev.ps1 -Help
```

**Características:**
- ✅ Verificação automática de pré-requisitos
- ✅ Detecção automática de npm/yarn
- ✅ Configuração automática de arquivos de ambiente
- ✅ Instalação de dependências
- ✅ Inicialização em janelas separadas do PowerShell
- ✅ Interface colorida e amigável

#### 2. JavaScript Script (Cross-Platform) - `start-dev.js`

**Recomendado para macOS, Linux e Windows**

```bash
# Executar com todas as opções
node start-dev.js

# Apenas instalar dependências
node start-dev.js --install-only

# Pular instalação e iniciar serviços
node start-dev.js --skip-install

# Exibir ajuda
node start-dev.js --help
```

**Características:**
- ✅ Compatível com Windows, macOS e Linux
- ✅ Verificação automática de pré-requisitos
- ✅ Detecção automática de npm/yarn
- ✅ Configuração automática de arquivos de ambiente
- ✅ Interface interativa
- ✅ Execução em background
- ✅ Tratamento de erros robusto

#### 3. Batch Script (Windows) - `start-dev.bat`

**Opção simples para Windows**

```cmd
# Executar o script
start-dev.bat
```

**Características:**
- ✅ Interface simples e intuitiva
- ✅ Perguntas interativas
- ✅ Inicialização em janelas separadas
- ✅ Suporte a UTF-8

### Scripts de Parada

#### 1. JavaScript Script (Cross-Platform) - `stop-dev.js`

**Recomendado para macOS, Linux e Windows**

```bash
# Parar todos os serviços
node stop-dev.js

# Exibir ajuda
node stop-dev.js --help
```

**Características:**
- ✅ Compatível com Windows, macOS e Linux
- ✅ Para processos por nome e porta
- ✅ Detecta automaticamente o sistema operacional
- ✅ Interface colorida e informativa
- ✅ Verificação de processos rodando

#### 2. PowerShell Script (Windows) - `stop-dev.ps1`

```powershell
# Parar todos os serviços
.\stop-dev.ps1

# Exibir ajuda
.\stop-dev.ps1 -Help
```

#### 3. Batch Script (Windows) - `stop-dev.bat`

```cmd
# Parar todos os serviços
stop-dev.bat
```

## 🔧 O que os Scripts Fazem

### 1. Verificação de Pré-requisitos
- ✅ Verifica se o Node.js está instalado
- ✅ Detecta automaticamente npm ou yarn
- ✅ Exibe versões encontradas

### 2. Configuração de Ambiente
- ✅ Cria arquivo `.env` para o backend (se não existir)
- ✅ Cria arquivo `.env.development` para o frontend (se não existir)
- ✅ Copia dos arquivos de exemplo

### 3. Instalação de Dependências
- ✅ Instala dependências do backend (`test-sps-server`)
- ✅ Instala dependências do frontend (`test-sps-react`)
- ✅ Suporte a npm e yarn

### 4. Inicialização dos Serviços
- ✅ Inicia o backend na porta 3000
- ✅ Inicia o frontend na porta 3001
- ✅ Aguarda o backend inicializar antes do frontend

## 📊 Portas Utilizadas

| Serviço | Porta | URL |
|---------|-------|-----|
| Backend | 3000 | http://localhost:3000 |
| Frontend | 3001 | http://localhost:3001 |
| API Docs | 3000 | http://localhost:3000/api-docs |

## 🛠️ Comandos Manuais

Se preferir executar manualmente:

### Backend
```bash
cd test-sps-server
npm install  # ou yarn install
npm run dev  # ou yarn dev
```

### Frontend
```bash
cd test-sps-react
npm install  # ou yarn install
npm start    # ou yarn start
```

## 🛑 Como Parar os Serviços

### Usando Scripts de Automação
```bash
# JavaScript (Cross-Platform)
node stop-dev.js

# PowerShell (Windows)
.\stop-dev.ps1

# Batch (Windows)
stop-dev.bat
```

### Manualmente
- **Windows:** Feche as janelas do terminal onde os serviços estão rodando
- **macOS/Linux:** Use `Ctrl+C` nos terminais onde os serviços estão rodando
- **JavaScript Script:** Use `Ctrl+C` no terminal principal

### Forçar Parada (se necessário)
```bash
# Windows
taskkill /f /im node.exe

# macOS/Linux
pkill -f node
```

## 🔍 Solução de Problemas

### Erro: "Node.js não está instalado"
**Solução:** Instale o Node.js em https://nodejs.org/

### Erro: "Nenhum gerenciador de pacotes encontrado"
**Solução:** Instale npm (vem com Node.js) ou yarn:
```bash
npm install -g yarn
```

### Erro: "Porta já em uso"
**Solução:** Verifique se não há outros serviços rodando nas portas 3000 e 3001:
```bash
# Windows
netstat -ano | findstr :3000
netstat -ano | findstr :3001

# macOS/Linux
lsof -i :3000
lsof -i :3001
```

### Erro: "Arquivo .env não encontrado"
**Solução:** Os scripts criam automaticamente os arquivos de ambiente. Se o erro persistir, copie manualmente:
```bash
cp test-sps-server/env.example test-sps-server/.env
cp test-sps-react/env.development.example test-sps-react/.env.development
```

## 📝 Logs e Debug

### JavaScript Script (start-dev.js)
- Logs coloridos no terminal
- Execução em background
- Use `Ctrl+C` para parar todos os serviços

### PowerShell Script (start-dev.ps1)
- Logs coloridos no terminal
- Janelas separadas para cada serviço
- Use `Ctrl+C` para parar

### Batch Script (start-dev.bat)
- Interface simples
- Janelas separadas para cada serviço
- Feche as janelas para parar

### Scripts de Parada
- **JavaScript (stop-dev.js):** Logs coloridos, compatível com todas as plataformas
- **PowerShell (stop-dev.ps1):** Logs coloridos, específico para Windows
- **Batch (stop-dev.bat):** Interface simples, específico para Windows

## 🎯 Recomendações

### Scripts de Inicialização
1. **Windows com PowerShell:** Use `start-dev.ps1`
2. **macOS/Linux:** Use `start-dev.js`
3. **Windows simples:** Use `start-dev.bat`
4. **Desenvolvimento:** Use `--skip-install` após a primeira execução

### Scripts de Parada
1. **Cross-Platform:** Use `stop-dev.js` (recomendado)
2. **Windows com PowerShell:** Use `stop-dev.ps1`
3. **Windows simples:** Use `stop-dev.bat`

## 📞 Suporte

Se encontrar problemas:
1. Verifique os pré-requisitos
2. Execute com `--help` para ver as opções
3. Verifique os logs de erro
4. Tente executar os comandos manualmente
