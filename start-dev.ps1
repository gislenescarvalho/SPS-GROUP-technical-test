# Script de Automação para SPS Group Technical Test
# Este script automatiza a instalação de dependências e subida do frontend e backend

param(
    [switch]$InstallOnly,
    [switch]$SkipInstall,
    [switch]$Help
)

# Função para exibir ajuda
function Show-Help {
    Write-Host @"
Script de Automação para SPS Group Technical Test

Uso: .\start-dev.ps1 [opções]

Opções:
    -InstallOnly    Apenas instala as dependências, não inicia os serviços
    -SkipInstall    Pula a instalação de dependências e inicia diretamente os serviços
    -Help          Exibe esta mensagem de ajuda

Exemplos:
    .\start-dev.ps1                    # Instala dependências e inicia ambos os serviços
    .\start-dev.ps1 -InstallOnly       # Apenas instala as dependências
    .\start-dev.ps1 -SkipInstall       # Inicia os serviços sem reinstalar dependências
"@
}

# Função para verificar se um comando existe
function Test-Command {
    param($Command)
    try {
        Get-Command $Command -ErrorAction Stop | Out-Null
        return $true
    }
    catch {
        return $false
    }
}

# Função para verificar se Node.js está instalado
function Test-NodeJS {
    if (-not (Test-Command "node")) {
        Write-Error "Node.js não está instalado. Por favor, instale o Node.js primeiro."
        Write-Host "Download: https://nodejs.org/"
        exit 1
    }
    
    $nodeVersion = node --version
    Write-Host "✓ Node.js encontrado: $nodeVersion" -ForegroundColor Green
}

# Função para verificar se npm/yarn está disponível
function Test-PackageManager {
    if (Test-Command "yarn") {
        $global:packageManager = "yarn"
        $yarnVersion = yarn --version
        Write-Host "✓ Yarn encontrado: $yarnVersion" -ForegroundColor Green
    }
    elseif (Test-Command "npm") {
        $global:packageManager = "npm"
        $npmVersion = npm --version
        Write-Host "✓ NPM encontrado: $npmVersion" -ForegroundColor Green
    }
    else {
        Write-Error "Nenhum gerenciador de pacotes (npm ou yarn) encontrado."
        exit 1
    }
}

# Função para instalar dependências
function Install-Dependencies {
    param($ProjectPath, $ProjectName)
    
    Write-Host "`n📦 Instalando dependências para $ProjectName..." -ForegroundColor Yellow
    
    Push-Location $ProjectPath
    
    try {
        if ($global:packageManager -eq "yarn") {
            yarn install
        }
        else {
            npm install
        }
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ Dependências instaladas com sucesso para $ProjectName" -ForegroundColor Green
        }
        else {
            Write-Error "❌ Erro ao instalar dependências para $ProjectName"
            exit 1
        }
    }
    catch {
        Write-Error "❌ Erro ao instalar dependências para $ProjectName: $_"
        exit 1
    }
    finally {
        Pop-Location
    }
}

# Função para configurar arquivos de ambiente
function Setup-EnvironmentFiles {
    Write-Host "`n🔧 Configurando arquivos de ambiente..." -ForegroundColor Yellow
    
    # Configurar arquivo .env para o backend
    if (-not (Test-Path "test-sps-server\.env")) {
        Write-Host "Criando arquivo .env para o backend..." -ForegroundColor Cyan
        Copy-Item "test-sps-server\env.example" "test-sps-server\.env"
        Write-Host "✓ Arquivo .env criado para o backend" -ForegroundColor Green
    }
    else {
        Write-Host "✓ Arquivo .env já existe para o backend" -ForegroundColor Green
    }
    
    # Configurar arquivo .env para o frontend
    if (-not (Test-Path "test-sps-react\.env.development")) {
        Write-Host "Criando arquivo .env.development para o frontend..." -ForegroundColor Cyan
        Copy-Item "test-sps-react\env.development.example" "test-sps-react\.env.development"
        Write-Host "✓ Arquivo .env.development criado para o frontend" -ForegroundColor Green
    }
    else {
        Write-Host "✓ Arquivo .env.development já existe para o frontend" -ForegroundColor Green
    }
}

# Função para iniciar o backend
function Start-Backend {
    Write-Host "`n🚀 Iniciando o backend..." -ForegroundColor Yellow
    
    Push-Location "test-sps-server"
    
    try {
        if ($global:packageManager -eq "yarn") {
            Start-Process powershell -ArgumentList "-NoExit", "-Command", "yarn dev"
        }
        else {
            Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev"
        }
        
        Write-Host "✓ Backend iniciado em uma nova janela do PowerShell" -ForegroundColor Green
        Write-Host "  URL: http://localhost:3000" -ForegroundColor Cyan
    }
    catch {
        Write-Error "❌ Erro ao iniciar o backend: $_"
        exit 1
    }
    finally {
        Pop-Location
    }
}

# Função para iniciar o frontend
function Start-Frontend {
    Write-Host "`n🚀 Iniciando o frontend..." -ForegroundColor Yellow
    
    # Aguardar um pouco para o backend inicializar
    Start-Sleep -Seconds 3
    
    Push-Location "test-sps-react"
    
    try {
        if ($global:packageManager -eq "yarn") {
            Start-Process powershell -ArgumentList "-NoExit", "-Command", "yarn start"
        }
        else {
            Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm start"
        }
        
        Write-Host "✓ Frontend iniciado em uma nova janela do PowerShell" -ForegroundColor Green
        Write-Host "  URL: http://localhost:3001" -ForegroundColor Cyan
    }
    catch {
        Write-Error "❌ Erro ao iniciar o frontend: $_"
        exit 1
    }
    finally {
        Pop-Location
    }
}

# Função principal
function Main {
    Write-Host "==========================================" -ForegroundColor Magenta
    Write-Host "  SPS Group Technical Test - Auto Setup" -ForegroundColor Magenta
    Write-Host "==========================================" -ForegroundColor Magenta
    
    # Verificar se o help foi solicitado
    if ($Help) {
        Show-Help
        return
    }
    
    # Verificar pré-requisitos
    Write-Host "`n🔍 Verificando pré-requisitos..." -ForegroundColor Yellow
    Test-NodeJS
    Test-PackageManager
    
    # Configurar arquivos de ambiente
    Setup-EnvironmentFiles
    
    # Instalar dependências se não foi solicitado para pular
    if (-not $SkipInstall) {
        Write-Host "`n📦 Instalando dependências..." -ForegroundColor Yellow
        Install-Dependencies "test-sps-server" "Backend"
        Install-Dependencies "test-sps-react" "Frontend"
    }
    else {
        Write-Host "`n⏭️  Pulando instalação de dependências..." -ForegroundColor Yellow
    }
    
    # Se apenas instalação foi solicitada, parar aqui
    if ($InstallOnly) {
        Write-Host "`n✅ Instalação concluída!" -ForegroundColor Green
        Write-Host "Para iniciar os serviços, execute: .\start-dev.ps1 -SkipInstall" -ForegroundColor Cyan
        return
    }
    
    # Iniciar serviços
    Write-Host "`n🚀 Iniciando serviços..." -ForegroundColor Yellow
    Start-Backend
    Start-Frontend
    
    Write-Host "`n==========================================" -ForegroundColor Magenta
    Write-Host "✅ Setup concluído com sucesso!" -ForegroundColor Green
    Write-Host "==========================================" -ForegroundColor Magenta
    Write-Host "`n📋 Resumo dos serviços:" -ForegroundColor Yellow
    Write-Host "  Backend:  http://localhost:3000" -ForegroundColor Cyan
    Write-Host "  Frontend: http://localhost:3001" -ForegroundColor Cyan
    Write-Host "  API Docs: http://localhost:3000/api-docs" -ForegroundColor Cyan
    Write-Host "`n💡 Dica: Os serviços estão rodando em janelas separadas do PowerShell" -ForegroundColor Yellow
    Write-Host "   Para parar os serviços, feche as janelas do PowerShell correspondentes" -ForegroundColor Yellow
}

# Executar função principal
Main
