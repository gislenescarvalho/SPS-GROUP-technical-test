@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ==========================================
echo   SPS Group Technical Test - Auto Setup
echo ==========================================

REM Verificar se Node.js está instalado
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js não está instalado. Por favor, instale o Node.js primeiro.
    echo Download: https://nodejs.org/
    pause
    exit /b 1
)

echo ✓ Node.js encontrado

REM Verificar se yarn ou npm está disponível
yarn --version >nul 2>&1
if %errorlevel% equ 0 (
    set PACKAGE_MANAGER=yarn
    echo ✓ Yarn encontrado
) else (
    npm --version >nul 2>&1
    if %errorlevel% equ 0 (
        set PACKAGE_MANAGER=npm
        echo ✓ NPM encontrado
    ) else (
        echo ❌ Nenhum gerenciador de pacotes (npm ou yarn) encontrado.
        pause
        exit /b 1
    )
)

REM Configurar arquivos de ambiente
echo.
echo 🔧 Configurando arquivos de ambiente...

REM Obter o diretório raiz do projeto (onde está o script)
set "SCRIPT_DIR=%~dp0"
set "PROJECT_ROOT=%SCRIPT_DIR:~0,-1%"

if not exist "%PROJECT_ROOT%\test-sps-server\.env" (
    echo Criando arquivo .env para o backend...
    copy "%PROJECT_ROOT%\test-sps-server\env.example" "%PROJECT_ROOT%\test-sps-server\.env" >nul
    if %errorlevel% equ 0 (
        echo ✓ Arquivo .env criado para o backend
    ) else (
        echo ❌ Erro ao criar arquivo .env para o backend
    )
) else (
    echo ✓ Arquivo .env já existe para o backend
)

if not exist "%PROJECT_ROOT%\test-sps-react\.env" (
    echo Criando arquivo .env para o frontend...
    copy "%PROJECT_ROOT%\test-sps-react\env.example" "%PROJECT_ROOT%\test-sps-react\.env" >nul
    if %errorlevel% equ 0 (
        echo ✓ Arquivo .env criado para o frontend
    ) else (
        echo ❌ Erro ao criar arquivo .env para o frontend
    )
) else (
    echo ✓ Arquivo .env já existe para o frontend
)

REM Perguntar se deve instalar dependências
echo.
set /p INSTALL_DEPS="Deseja instalar as dependências? (s/n): "
if /i "%INSTALL_DEPS%"=="s" (
    echo.
    echo 📦 Instalando dependências...
    
    echo Instalando dependências do Backend...
    cd test-sps-server
    if "%PACKAGE_MANAGER%"=="yarn" (
        yarn install
    ) else (
        npm install
    )
    if %errorlevel% neq 0 (
        echo ❌ Erro ao instalar dependências do Backend
        pause
        exit /b 1
    )
    cd ..
    
    echo Instalando dependências do Frontend...
    cd test-sps-react
    if "%PACKAGE_MANAGER%"=="yarn" (
        yarn install
    ) else (
        npm install
    )
    if %errorlevel% neq 0 (
        echo ❌ Erro ao instalar dependências do Frontend
        pause
        exit /b 1
    )
    cd ..
    
    echo ✓ Dependências instaladas com sucesso
)

REM Perguntar se deve iniciar os serviços
echo.
set /p START_SERVICES="Deseja iniciar os serviços agora? (s/n): "
if /i "%START_SERVICES%"=="s" (
    echo.
    echo 🚀 Iniciando serviços...
    
    REM Iniciar backend em nova janela
    echo Iniciando Backend...
    start "Backend - SPS Group Test" cmd /k "cd /d %~dp0test-sps-server && if "%PACKAGE_MANAGER%"=="yarn" (yarn dev) else (npm run dev)"
    
    REM Aguardar um pouco
    timeout /t 3 /nobreak >nul
    
    REM Iniciar frontend em nova janela
    echo Iniciando Frontend...
    start "Frontend - SPS Group Test" cmd /k "cd /d %~dp0test-sps-react && if "%PACKAGE_MANAGER%"=="yarn" (yarn start) else (npm start)"
    
    echo.
    echo ==========================================
    echo ✅ Setup concluído com sucesso!
    echo ==========================================
    echo.
    echo 📋 Resumo dos serviços:
    echo   Backend:  http://localhost:3000
    echo   Frontend: http://localhost:3001
    echo   API Docs: http://localhost:3000/api-docs
    echo.
    echo 💡 Dica: Os serviços estão rodando em janelas separadas
    echo    Para parar os serviços, feche as janelas correspondentes
) else (
    echo.
    echo ✅ Setup concluído!
    echo Para iniciar os serviços manualmente:
    echo   Backend:  cd test-sps-server ^&^& %PACKAGE_MANAGER% dev
    echo   Frontend: cd test-sps-react ^&^& %PACKAGE_MANAGER% start
)

echo.
pause
