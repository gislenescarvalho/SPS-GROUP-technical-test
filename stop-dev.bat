@echo off
chcp 65001 >nul

echo ==========================================
echo   SPS Group Technical Test - Stop Services
echo ==========================================

echo.
echo 🛑 Parando serviços...

REM Parar processos Node.js
echo Parando processos Node.js...
taskkill /f /im node.exe >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Processos Node.js parados
) else (
    echo ℹ️  Nenhum processo Node.js encontrado
)

REM Parar processos npm
echo Parando processos npm...
taskkill /f /im npm.cmd >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Processos npm parados
) else (
    echo ℹ️  Nenhum processo npm encontrado
)

REM Parar processos yarn
echo Parando processos yarn...
taskkill /f /im yarn.cmd >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Processos yarn parados
) else (
    echo ℹ️  Nenhum processo yarn encontrado
)

REM Parar processos nas portas 3000 e 3001
echo Parando processos nas portas 3000 e 3001...

for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
    taskkill /f /pid %%a >nul 2>&1
    if !errorlevel! equ 0 (
        echo ✓ Processo na porta 3000 parado (PID: %%a)
    )
)

for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001') do (
    taskkill /f /pid %%a >nul 2>&1
    if !errorlevel! equ 0 (
        echo ✓ Processo na porta 3001 parado (PID: %%a)
    )
)

echo.
echo ==========================================
echo ✅ Serviços parados com sucesso!
echo ==========================================
echo.
echo 💡 Dica: Se algum serviço ainda estiver rodando,
echo    feche manualmente as janelas do terminal correspondentes
echo.
pause
