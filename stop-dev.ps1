# Script para Parar Serviços - SPS Group Technical Test
# Este script para os processos do frontend e backend

param(
    [switch]$Help
)

# Função para exibir ajuda
function Show-Help {
    Write-Host @"
Script para Parar Serviços - SPS Group Technical Test

Uso: .\stop-dev.ps1 [opções]

Opções:
    -Help          Exibe esta mensagem de ajuda

Este script para os processos do frontend e backend que foram iniciados pelos scripts de automação.
"@
}

# Função para parar processos por nome
function Stop-ProcessesByName {
    param($ProcessNames)
    
    foreach ($processName in $ProcessNames) {
        $processes = Get-Process -Name $processName -ErrorAction SilentlyContinue
        if ($processes) {
            Write-Host "🛑 Parando processos: $processName" -ForegroundColor Yellow
            $processes | Stop-Process -Force
            Write-Host "✓ Processos $processName parados" -ForegroundColor Green
        } else {
            Write-Host "ℹ️  Nenhum processo $processName encontrado" -ForegroundColor Cyan
        }
    }
}

# Função para parar processos por porta
function Stop-ProcessesByPort {
    param($Ports)
    
    foreach ($port in $Ports) {
        try {
            $connections = netstat -ano | Select-String ":$port\s"
            if ($connections) {
                Write-Host "🛑 Parando processos na porta $port" -ForegroundColor Yellow
                $connections | ForEach-Object {
                    $processId = ($_ -split '\s+')[-1]
                    if ($processId -match '^\d+$') {
                        try {
                            Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
                            Write-Host "✓ Processo PID $processId parado" -ForegroundColor Green
                        } catch {
                            Write-Host "⚠️  Não foi possível parar processo PID $processId" -ForegroundColor Yellow
                        }
                    }
                }
            } else {
                Write-Host "ℹ️  Nenhum processo encontrado na porta $port" -ForegroundColor Cyan
            }
        } catch {
            Write-Host "⚠️  Erro ao verificar porta $port" -ForegroundColor Yellow
        }
    }
}

# Função principal
function Main {
    Write-Host "==========================================" -ForegroundColor Magenta
    Write-Host "  SPS Group Technical Test - Stop Services" -ForegroundColor Magenta
    Write-Host "==========================================" -ForegroundColor Magenta
    
    # Verificar se o help foi solicitado
    if ($Help) {
        Show-Help
        return
    }
    
    Write-Host "`n🛑 Parando serviços..." -ForegroundColor Yellow
    
    # Parar processos por nome (comuns do Node.js)
    $nodeProcesses = @("node", "npm", "yarn")
    Stop-ProcessesByName $nodeProcesses
    
    # Parar processos por porta (3000 e 3001)
    $ports = @(3000, 3001)
    Stop-ProcessesByPort $ports
    
    # Parar janelas do PowerShell com títulos específicos
    Write-Host "`n🛑 Fechando janelas do PowerShell..." -ForegroundColor Yellow
    $powershellWindows = Get-Process | Where-Object { 
        $_.ProcessName -eq "powershell" -and 
        $_.MainWindowTitle -match "(Backend|Frontend|SPS Group Test)"
    }
    
    if ($powershellWindows) {
        $powershellWindows | ForEach-Object {
            try {
                $_.CloseMainWindow()
                Write-Host "✓ Janela PowerShell fechada" -ForegroundColor Green
            } catch {
                Write-Host "⚠️  Não foi possível fechar janela PowerShell" -ForegroundColor Yellow
            }
        }
    } else {
        Write-Host "ℹ️  Nenhuma janela PowerShell específica encontrada" -ForegroundColor Cyan
    }
    
    Write-Host "`n==========================================" -ForegroundColor Magenta
    Write-Host "✅ Serviços parados com sucesso!" -ForegroundColor Green
    Write-Host "==========================================" -ForegroundColor Magenta
    Write-Host "`n💡 Dica: Se algum serviço ainda estiver rodando," -ForegroundColor Yellow
    Write-Host "   feche manualmente as janelas do terminal correspondentes" -ForegroundColor Yellow
}

# Executar função principal
Main
